package accessesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type giveAccessBody struct {
	UserId uuid.UUID          `json:"userId" validate:"required,uuid4"`
	Role   *dbClient.UserRole `json:"role" validate:"oneof=owner admin member commentator guest"`
}

// @Summary				Give access to a page
// @Description 		Give access to a page
// @Tags				Page Accesses
// @Accept				json
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				page_id path string true "Page ID"
// @Param				body body giveAccessBody true "Give access to a page"
// @Success				200 {string} string "Success"
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to page or workspace or no access to give access to page"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/pages/{page_id}/accesses [put]
func updateAccess(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId := uuid.MustParse(ctx.Param("page_id"))

		var body giveAccessBody
		if err := ctx.BindJSON(&body); err != nil {
			errorHandlers.BadRequest(ctx, "invalid request body", nil)
			return
		}

		currentUserId, _ := routerUtils.GetUserIdFromSession(ctx)

		tx := postgres.Begin()
		defer func() {
			if r := recover(); r != nil {
				tx.Rollback()
				errorHandlers.InternalServerError(ctx, "An unexpected error occurred")
			}
		}()

		page, pageAccess, ok := routerUtils.CheckPageAccess(ctx, postgres, postgres, pageId, currentUserId)

		if !ok {
			tx.Rollback()
			errorHandlers.Forbidden(ctx, "No access to page")
			return
		}

		if !canModifyAccess(page, pageAccess.Role, postgres, ctx, pageId, currentUserId, body.UserId, body.Role) {
			tx.Rollback()
			return
		}

		if err := handleAccessUpdate(ctx, pageAccess, tx, pageId, body, currentUserId); err != nil {
			tx.Rollback()
			return
		}

		if err := tx.Commit().Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to commit transaction")
			return
		}

		ctx.String(200, "Success")
	}
}

func canModifyAccess(page dbClient.Page, currentUserRole dbClient.UserRole, postgres *gorm.DB, ctx *gin.Context, pageId uuid.UUID, currentUserId uuid.UUID, targetUserId uuid.UUID, targetRole *dbClient.UserRole) bool {
	if currentUserRole != dbClient.UserRoleOwner && currentUserRole != dbClient.UserRoleAdmin {
		errorHandlers.Forbidden(ctx, "Not allowed to change access to page")
		return false
	}

	if currentUserRole == dbClient.UserRoleOwner && currentUserId == targetUserId && (targetRole == nil || *targetRole != dbClient.UserRoleOwner) {
		if !checkOtherOwnerExists(pageId, ctx, postgres, currentUserId) {
			errorHandlers.Forbidden(ctx, "Not allowed to remove the only owner of the page. Set another owner first")
			return false
		}
	}

	if currentUserRole == dbClient.UserRoleAdmin && targetRole != nil && (*targetRole == dbClient.UserRoleOwner || *targetRole == dbClient.UserRoleAdmin) {
		errorHandlers.Forbidden(ctx, "Admin can't give admin or owner access")
		return false
	}

	workspaceId := uuid.MustParse(ctx.Param("workspace_id"))

	if ok, err := checkWorkspaceAdminOrOwner(postgres, workspaceId, currentUserId); err != nil {
		errorHandlers.InternalServerError(ctx, "Failed to check workspace access")
		return false
	} else if !ok {
		errorHandlers.Forbidden(ctx, "Cannot change page access for workspace admin or owner")
		return false
	}

	if page.ParentPageID != nil {
		if ok, err := checkParentPageAdminOrOwner(postgres, *page.ParentPageID, currentUserId); err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to check parent page access")
			return false
		} else if !ok {
			errorHandlers.Forbidden(ctx, "Cannot change page access for parent page admin or owner")
			return false
		}
	}

	return true
}

func checkWorkspaceAdminOrOwner(postgres *gorm.DB, workspaceId uuid.UUID, userId uuid.UUID) (bool, error) {
	var workspaceAccess dbClient.WorkspaceAccess

	if err := postgres.First(&workspaceAccess, "workspace_id = ? AND user_id = ?", workspaceId, userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}
		return false, err
	}

	if workspaceAccess.Role == dbClient.UserRoleOwner || workspaceAccess.Role == dbClient.UserRoleAdmin {
		return true, nil
	}

	return false, nil
}

func checkParentPageAdminOrOwner(postgres *gorm.DB, pageId uuid.UUID, userId uuid.UUID) (bool, error) {
	var parentPage dbClient.Page

	if err := postgres.First(&parentPage, "id = ?", pageId).Error; err != nil {
		return false, err
	}

	var pageAccess dbClient.PageAccess

	if err := postgres.First(&pageAccess, "page_id = ? AND user_id = ?", parentPage.ID, userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, nil
		}

		return false, err
	}

	if pageAccess.Role == dbClient.UserRoleOwner || pageAccess.Role == dbClient.UserRoleAdmin {
		return true, nil
	}

	return false, nil
}

func checkOtherOwnerExists(pageId uuid.UUID, ctx *gin.Context, postgres *gorm.DB, currentUserId uuid.UUID) bool {
	var nonCurrentUserOwner dbClient.PageAccess
	if err := postgres.First(&nonCurrentUserOwner, "page_id = ? AND role = ? AND user_id <> ?", pageId, dbClient.UserRoleOwner, currentUserId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false
		}
		errorHandlers.InternalServerError(ctx, "Failed to check access to the page")
		return false
	}
	return true
}

func handleAccessUpdate(ctx *gin.Context, pageAccess dbClient.PageAccess, tx *gorm.DB, pageId uuid.UUID, body giveAccessBody, currentUserId uuid.UUID) error {
	if body.Role == nil {
		if err := tx.Where("page_id = ? AND user_id = ?", pageId, body.UserId).Delete(&dbClient.PageAccess{}).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to delete page access")
			return err
		}

		return nil
	}

	var bodyUserAccess dbClient.PageAccess
	if body.UserId == currentUserId {
		bodyUserAccess = pageAccess
	} else {
		if err := tx.First(&bodyUserAccess, "page_id = ? AND user_id = ?", pageId, body.UserId).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				errorHandlers.InternalServerError(ctx, "Failed to get page access")
				return err
			} else {
				bodyUserAccess = dbClient.PageAccess{PageID: pageId, UserID: body.UserId, Role: *body.Role}

				if err := tx.Create(&bodyUserAccess).Error; err != nil {
					errorHandlers.InternalServerError(ctx, "Failed to create page access")
					return err
				}

				return nil
			}
		}
	}

	if err := tx.Model(&bodyUserAccess).Update("role", *body.Role).Error; err != nil {
		errorHandlers.InternalServerError(ctx, "Failed to update page access")
		return err
	}

	return nil
}
