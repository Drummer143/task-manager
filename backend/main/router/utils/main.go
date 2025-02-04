package utils

import (
	"main/dbClient"
	"main/router/errorHandlers"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CheckPageAccess(ctx *gin.Context, db *gorm.DB, pageId uuid.UUID, userId uuid.UUID) (page dbClient.Page, pageAccess dbClient.PageAccess, ok bool) {
	include := ctx.Query("include")

	var scopedDB = db

	if strings.Contains(include, "tasks") {
		scopedDB = scopedDB.Preload("Tasks")
	}

	if strings.Contains(include, "textLines") {
		scopedDB = scopedDB.Preload("TextPageLine")
	}

	if err := scopedDB.First(&page, "id = ?", pageId).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			errorHandlers.NotFound(ctx, "page not found")
			return page, pageAccess, false
		} else {
			errorHandlers.InternalServerError(ctx, "failed to get page")
			return page, pageAccess, false
		}
	}

	if err := db.First(&pageAccess, "page_id = ? AND user_id = ?", pageId, userId).Error; err != nil {
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
