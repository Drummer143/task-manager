package routerUtils

import (
	"libs/backend/errorHandlers/libs/errorCodes"
	"libs/backend/errorHandlers/libs/errorHandlers"
	"main/internal/postgres"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CheckPageAccess(ctx *gin.Context, dbWithIncludes *gorm.DB, postgres *gorm.DB, pageId uuid.UUID, userId uuid.UUID) (page postgres.Page, pageAccess postgres.PageAccess, ok bool) {
	if err := dbWithIncludes.First(&page, "id = ?", pageId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityPage)
			return page, pageAccess, false
		} else {
			errorHandlers.InternalServerError(ctx)
			return page, pageAccess, false
		}
	}

	if err := postgres.First(&pageAccess, "page_id = ? AND user_id = ?", pageId, userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityPage)
			return page, pageAccess, false
		} else {
			errorHandlers.InternalServerError(ctx)
			return page, pageAccess, false
		}
	}

	return page, pageAccess, true
}

func CheckWorkspaceAccess(ctx *gin.Context, dbWithIncludes *gorm.DB, postgres *gorm.DB, workspaceId uuid.UUID, userId uuid.UUID) (workspace postgres.Workspace, workspaceAccess postgres.WorkspaceAccess, ok bool) {
	if err := dbWithIncludes.First(&workspace, "id = ?", workspaceId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, errorCodes.NotFoundErrorCodeNotFound, errorCodes.DetailCodeEntityWorkspace)
			return workspace, workspaceAccess, false
		} else {
			errorHandlers.InternalServerError(ctx)
			return workspace, workspaceAccess, false
		}
	}

	if err := postgres.First(&workspaceAccess, "workspace_id = ? AND user_id = ?", workspaceId, userId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.Forbidden(ctx, errorCodes.ForbiddenErrorCodeAccessDenied, errorCodes.DetailCodeEntityWorkspace)
			return workspace, workspaceAccess, false
		} else {
			errorHandlers.InternalServerError(ctx)
			return workspace, workspaceAccess, false
		}
	}

	workspace.Role = &workspaceAccess.Role

	return workspace, workspaceAccess, true
}

func GiveAccessToWorkspaceAdmins(db *gorm.DB, pageID uuid.UUID, workspaceID uuid.UUID) error {
	var workspaceAdmins []postgres.WorkspaceAccess

	err := db.
		Where("workspace_id = ? AND role IN (?)", workspaceID, []postgres.UserRole{postgres.UserRoleOwner, postgres.UserRoleAdmin}).
		Find(&workspaceAdmins).Error

	if err != nil {
		return err
	}

	for _, access := range workspaceAdmins {
		pageAccess := postgres.PageAccess{
			ID:        uuid.New(),
			Role:      postgres.UserRoleAdmin,
			UserID:    access.UserID,
			PageID:    pageID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.First(&postgres.PageAccess{}, "page_id = ? AND user_id = ?", pageID, access.UserID).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				return err
			}
		} else {
			continue
		}

		if err := db.Create(&pageAccess).Error; err != nil {
			return err
		}
	}

	return nil
}

func GiveAccessToParentPageAdmins(db *gorm.DB, pageID uuid.UUID, parentPageID uuid.UUID) error {
	var pageAdmins []postgres.PageAccess

	err := db.
		Where("page_id = ? AND role IN (?)", parentPageID, []postgres.UserRole{postgres.UserRoleOwner, postgres.UserRoleAdmin}).
		Find(&pageAdmins).Error

	if err != nil {
		return err
	}

	for _, access := range pageAdmins {
		pageAccess := postgres.PageAccess{
			ID:        uuid.New(),
			Role:      postgres.UserRoleAdmin,
			UserID:    access.UserID,
			PageID:    pageID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.First(&postgres.PageAccess{}, "page_id = ? AND user_id = ?", pageID, access.UserID).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				return err
			}
		} else {
			continue
		}

		if err := db.Create(&pageAccess).Error; err != nil {
			return err
		}
	}

	return nil
}
