package accessesRouter

import (
	"main/dbClient"
	"main/router/errorHandlers"
	routerUtils "main/router/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type getPageAccessesResponse struct {
	dbClient.PageAccess
	IsWorkspaceOwner bool `json:"isWorkspaceOwner"`
	IsWorkspaceAdmin bool `json:"isWorkspaceAdmin"`
}

// @Summary				Get page accesses
// @Description 		Get page accesses
// @Tags				Page Accesses
// @Produce				json
// @Param				workspace_id path string true "Workspace ID"
// @Param				page_id path string true "Page ID"
// @Success				200 {object} []getPageAccessesResponse
// @Failure				400 {object} errorHandlers.Error
// @Failure				401 {object} errorHandlers.Error "Unauthorized if session is missing or invalid"
// @Failure				403 {object} errorHandlers.Error "No access to page or workspace or no access to get page accesses"
// @Failure				404 {object} errorHandlers.Error
// @Failure				500 {object} errorHandlers.Error
// @Router				/workspaces/{workspace_id}/pages/{page_id}/accesses [get]
func getPageAccesses(postgres *gorm.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		pageId := uuid.MustParse(ctx.Param("page_id"))

		userId, _ := routerUtils.GetUserIdFromSession(ctx)

		_, access, ok := routerUtils.CheckPageAccess(ctx, postgres, postgres, pageId, userId)

		if !ok {
			return
		}

		if access.Role != dbClient.UserRoleOwner && access.Role != dbClient.UserRoleAdmin {
			errorHandlers.Forbidden(ctx, "no access to page")
			return
		}

		var pageAccesses []dbClient.PageAccess

		if err := postgres.Preload("User").Where("page_id = ?", pageId).Find(&pageAccesses).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get page accesses")
			return
		}

		var workspaceOwnersAndAdmins []dbClient.WorkspaceAccess

		if err := postgres.Where("workspace_id = ? AND (role = ? OR role = ?)", uuid.MustParse(ctx.Param("workspace_id")), dbClient.UserRoleOwner, dbClient.UserRoleAdmin).Find(&workspaceOwnersAndAdmins).Error; err != nil {
			errorHandlers.InternalServerError(ctx, "failed to get workspace owners and admins")
			return
		}

		workspaceOwnersAndAdminsMap := make(map[uuid.UUID]map[dbClient.UserRole]bool)

		for _, wa := range workspaceOwnersAndAdmins {
			if _, exists := workspaceOwnersAndAdminsMap[wa.UserID]; !exists {
				workspaceOwnersAndAdminsMap[wa.UserID] = make(map[dbClient.UserRole]bool)
			}
			workspaceOwnersAndAdminsMap[wa.UserID][wa.Role] = true
		}

		// Создание результата
		var response []getPageAccessesResponse
		for _, pa := range pageAccesses {
			res := getPageAccessesResponse{
				PageAccess:       pa,
				IsWorkspaceOwner: workspaceOwnersAndAdminsMap[pa.UserID][dbClient.UserRoleOwner],
				IsWorkspaceAdmin: workspaceOwnersAndAdminsMap[pa.UserID][dbClient.UserRoleAdmin],
			}
			response = append(response, res)
		}

		if !ok {
			return
		}

		ctx.JSON(http.StatusOK, response)
	}
}
