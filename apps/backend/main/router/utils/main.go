package routerUtils

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CheckPageAccess(ctx *gin.Context, dbWithIncludes *gorm.DB, postgres *gorm.DB, pageId uuid.UUID, userId uuid.UUID) (page dbClient.Page, pageAccess dbClient.PageAccess, ok bool) {
	if err := dbWithIncludes.First(&page, "id = ?", pageId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, "page not found")
			return page, pageAccess, false
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get page")
			return page, pageAccess, false
		}
	}

	if err := postgres.First(&pageAccess, "page_id = ? AND user_id = ?", pageId, userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.Forbidden(ctx, "page access not found")
			return page, pageAccess, false
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get page access")
			return page, pageAccess, false
		}
	}

	return page, pageAccess, true
}

func CheckWorkspaceAccess(ctx *gin.Context, dbWithIncludes *gorm.DB, postgres *gorm.DB, workspaceId uuid.UUID, userId uuid.UUID) (workspace dbClient.Workspace, workspaceAccess dbClient.WorkspaceAccess, ok bool) {
	if err := dbWithIncludes.First(&workspace, "id = ?", workspaceId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, "workspace not found")
			return workspace, workspaceAccess, false
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get workspace")
			return workspace, workspaceAccess, false
		}
	}

	if err := postgres.First(&workspaceAccess, "workspace_id = ? AND user_id = ?", workspaceId, userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.Forbidden(ctx, "no access to workspace")
			return workspace, workspaceAccess, false
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get workspace access")
			return workspace, workspaceAccess, false
		}
	}

	workspace.Role = &workspaceAccess.Role

	return workspace, workspaceAccess, true
}

func GetUserIdFromSession(ctx *gin.Context) (uuid.UUID, bool) {
	session := sessions.Default(ctx)

	userId, ok := session.Get("id").(uuid.UUID)

	return userId, ok
}

func GiveAccessToWorkspaceAdmins(postgres *gorm.DB, pageID uuid.UUID, workspaceID uuid.UUID) error {
	var workspaceAdmins []dbClient.WorkspaceAccess

	err := postgres.
		Where("workspace_id = ? AND role IN (?)", workspaceID, []dbClient.UserRole{dbClient.UserRoleOwner, dbClient.UserRoleAdmin}).
		Find(&workspaceAdmins).Error

	if err != nil {
		return err
	}

	for _, access := range workspaceAdmins {
		pageAccess := dbClient.PageAccess{
			ID:        uuid.New(),
			Role:      dbClient.UserRoleAdmin,
			UserID:    access.UserID,
			PageID:    pageID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := postgres.First(&dbClient.PageAccess{}, "page_id = ? AND user_id = ?", pageID, access.UserID).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				return err
			}
		} else {
			continue
		}

		if err := postgres.Create(&pageAccess).Error; err != nil {
			return err
		}
	}

	return nil
}

func GiveAccessToParentPageAdmins(postgres *gorm.DB, pageID uuid.UUID, parentPageID uuid.UUID) error {
	var pageAdmins []dbClient.PageAccess

	err := postgres.
		Where("page_id = ? AND role IN (?)", parentPageID, []dbClient.UserRole{dbClient.UserRoleOwner, dbClient.UserRoleAdmin}).
		Find(&pageAdmins).Error

	if err != nil {
		return err
	}

	for _, access := range pageAdmins {
		pageAccess := dbClient.PageAccess{
			ID:        uuid.New(),
			Role:      dbClient.UserRoleAdmin,
			UserID:    access.UserID,
			PageID:    pageID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := postgres.First(&dbClient.PageAccess{}, "page_id = ? AND user_id = ?", pageID, access.UserID).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				return err
			}
		} else {
			continue
		}

		if err := postgres.Create(&pageAccess).Error; err != nil {
			return err
		}
	}

	return nil
}
