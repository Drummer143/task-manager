package accessesRouter

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"main/utils/ginTools"
	"main/utils/routerUtils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type giveAccessBody struct {
	UserId uuid.UUID          `json:"userId" validate:"required,uuid4"`
	Role   *postgres.UserRole `json:"role" validate:"oneof=owner admin member commentator guest"`
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
func updateAccess(ctx *gin.Context) {
	var body giveAccessBody
	if err := ctx.BindJSON(&body); err != nil {
		errorHandlers.BadRequest(ctx, errorCodes.BadRequestErrorCodeInvalidBody, nil)
		return
	}

	tx := postgres.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			errorHandlers.InternalServerError(ctx)
		}
	}()

	pageId := uuid.MustParse(ctx.Param("page_id"))
	currentUser := ginTools.MustGetUser(ctx)

	if !checkAccess(ctx, tx, pageId, currentUser.ID, body.Role) {
		tx.Rollback()
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		return
	}

	ctx.String(200, "Success")
}

// 403 if:
// 1. no access to page
// 2. user is not admin or owner
// 3. user trying to change role to workspace owner
// 4. if user is admin and trying to change role to admin or owner
func checkAccess(ctx *gin.Context, tx *gorm.DB, pageId uuid.UUID, userId uuid.UUID, newRole *postgres.UserRole) bool {
	page, pageAccess, ok := routerUtils.CheckPageAccess(ctx, tx.Preload("Owner"), tx, pageId, userId)

	if !ok {
		return false
	}

	if pageAccess.Role != postgres.UserRoleOwner && pageAccess.Role != postgres.UserRoleAdmin {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeInsufficientPermissions, map[string]string{"action": errorCodes.DetailCodeActionChangeAccess, "target": errorCodes.DetailCodeEntityPage})
		return false
	}

	workspace, _, ok := routerUtils.CheckWorkspaceAccess(ctx, tx.Preload("Owner"), tx, page.WorkspaceID, userId)

	if !ok {
		return false
	}

	if userId == workspace.OwnerID {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeInsufficientPermissions, map[string]string{"action": errorCodes.DetailCodeActionChangeAccess, "target": errorCodes.DetailCodeEntityPage})
		return false
	}

	if pageAccess.Role == postgres.UserRoleAdmin && (*newRole == postgres.UserRoleAdmin || *newRole == postgres.UserRoleOwner) {
		errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeInsufficientPermissions, map[string]string{"action": errorCodes.DetailCodeActionChangeAccess, "target": errorCodes.DetailCodeEntityPage})
		return false
	}

	return true
}
