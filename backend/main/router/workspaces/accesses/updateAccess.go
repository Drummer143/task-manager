package workspacesAccessesRouter

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

// @Summary				Give access to a workspace	
// @Description 		Give access to a workspace
// @Tags				Workspace Accesses
// @Accept				json
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				workspace_id path string true "Workspace ID"
// @Param				body body giveAccessBody true "Give access to a workspace"
// @Success				200 {string} string "Success"
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to workspace or workspace or no access to give access to workspace"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/accesses [put]
func updateAccess(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		workspaceId := uuid.MustParse(ctx.Param("id"))

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

		_, workspaceAccess, ok := routerUtils.CheckWorkspaceAccess(ctx, postgres, postgres, workspaceId, currentUserId)

		if !ok {
			tx.Rollback()
			errorHandlers.Forbidden(ctx, "No access to workspace")
			return
		}

		if !canModifyAccess(workspaceAccess.Role, postgres, ctx, workspaceId, currentUserId, body.UserId, body.Role) {
			tx.Rollback()
			return
		}

		if err := handleAccessUpdate(ctx, workspaceAccess, tx, workspaceId, body, currentUserId); err != nil {
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

func canModifyAccess(currentUserRole dbClient.UserRole, postgres *gorm.DB, ctx *gin.Context, workspaceId uuid.UUID, currentUserId uuid.UUID, targetUserId uuid.UUID, targetRole *dbClient.UserRole) bool {
	if currentUserRole != dbClient.UserRoleOwner && currentUserRole != dbClient.UserRoleAdmin {
		errorHandlers.Forbidden(ctx, "Not allowed to change access to workspace")
		return false
	}

	if currentUserRole == dbClient.UserRoleOwner && currentUserId == targetUserId && (targetRole == nil || *targetRole != dbClient.UserRoleOwner) {
		if !checkOtherOwnerExists(workspaceId, ctx, postgres, currentUserId) {
			errorHandlers.Forbidden(ctx, "Not allowed to remove the only owner of the workspace. Set another owner first")
			return false
		}
	}

	if currentUserRole == dbClient.UserRoleAdmin && targetRole != nil && (*targetRole == dbClient.UserRoleOwner || *targetRole == dbClient.UserRoleAdmin) {
		errorHandlers.Forbidden(ctx, "Admin can't give admin or owner access")
		return false
	}

	return true
}

func checkOtherOwnerExists(workspaceId uuid.UUID, ctx *gin.Context, postgres *gorm.DB, currentUserId uuid.UUID) bool {
	var nonCurrentUserOwner dbClient.WorkspaceAccess
	if err := postgres.First(&nonCurrentUserOwner, "workspace_id = ? AND role = ? AND user_id <> ?", workspaceId, dbClient.UserRoleOwner, currentUserId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false
		}
		errorHandlers.InternalServerError(ctx, "Failed to check access to the workspace")
		return false
	}
	return true
}

func handleAccessUpdate(ctx *gin.Context, workspaceAccess dbClient.WorkspaceAccess, tx *gorm.DB, workspaceId uuid.UUID, body giveAccessBody, currentUserId uuid.UUID) error {
	if body.Role == nil {
		if err := tx.Where("workspace_id = ? AND user_id = ?", workspaceId, body.UserId).Delete(&dbClient.WorkspaceAccess{}).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to delete workspace access")
			return err
		}
	} else {
		var bodyUserAccess dbClient.WorkspaceAccess
		if body.UserId == currentUserId {
			bodyUserAccess = workspaceAccess
		} else {
			if err := tx.First(&bodyUserAccess, "workspace_id = ? AND user_id = ?", workspaceId, body.UserId).Error; err != nil {
				if err != gorm.ErrRecordNotFound {
					errorHandlers.InternalServerError(ctx, "Failed to get workspace access")
					return err
				}
			}
		}

		if err := tx.Model(&bodyUserAccess).Update("role", *body.Role).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "Failed to update workspace access")
			return err
		}
	}

	return nil
}
