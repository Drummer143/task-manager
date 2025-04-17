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
		workspaceId := uuid.MustParse(ctx.Param("workspace_id"))

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

		if !checkAccess(ctx, tx, workspaceId, currentUserId, body.Role) {
			tx.Rollback()
			return
		}

		var targetUserAccess dbClient.WorkspaceAccess

		if err := tx.First(&targetUserAccess, "workspace_id = ? AND user_id = ?", workspaceId, body.UserId).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				errorHandlers.InternalServerError(ctx, "failed to get workspace access")
				return
			}
		}

		if targetUserAccess == (dbClient.WorkspaceAccess{}) {
			if body.Role == nil {
				errorHandlers.BadRequest(ctx, "Target user has no access to workspace", nil)
				return
			}

			targetUserAccess = dbClient.WorkspaceAccess{
				WorkspaceID: workspaceId,
				UserID:      body.UserId,
				Role:        *body.Role,
			}

			if err := tx.Create(&targetUserAccess).Error; err != nil {
				errorHandlers.InternalServerError(ctx, "failed to create workspace access")
				return
			}
		} else {
			if body.Role == nil {
				if err := tx.Delete(&targetUserAccess).Error; err != nil {
					errorHandlers.InternalServerError(ctx, "failed to delete workspace access")
					return
				}
			} else {
				targetUserAccess.Role = *body.Role

				if err := tx.Save(&targetUserAccess).Error; err != nil {
					errorHandlers.InternalServerError(ctx, "failed to update workspace access")
					return
				}
			}
		}

		if err := tx.Commit().Error; err != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx, "failed to commit transaction")
			return
		}

		ctx.String(200, "Success")
	}
}

// 403 if:
// 1. no access to page
// 2. user is not admin or owner
// 4. if user is admin and trying to change role to admin or owner
func checkAccess(ctx *gin.Context, tx *gorm.DB, workspaceId uuid.UUID, userId uuid.UUID, newRole *dbClient.UserRole) bool {
	_, workspaceAccess, ok := routerUtils.CheckWorkspaceAccess(ctx, tx.Preload("Owner"), tx, workspaceId, userId)

	if !ok {
		return false
	}

	if workspaceAccess.Role != dbClient.UserRoleOwner && workspaceAccess.Role != dbClient.UserRoleAdmin {
		errorHandlers.Forbidden(ctx, "Not enough permissions to change access")
		return false
	}

	if !ok {
		return false
	}

	if workspaceAccess.Role == dbClient.UserRoleAdmin && (*newRole == dbClient.UserRoleAdmin || *newRole == dbClient.UserRoleOwner) {
		errorHandlers.Forbidden(ctx, "Cannot change role to admin or owner")
		return false
	}

	return true
}
