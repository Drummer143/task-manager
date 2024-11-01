// Package docs Code generated by swaggo/swag. DO NOT EDIT
package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{escape .Description}}",
        "title": "{{.Title}}",
        "contact": {},
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {
        "/auth/login": {
            "post": {
                "description": "Login",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Auth"
                ],
                "summary": "Login",
                "parameters": [
                    {
                        "description": "Login object",
                        "name": "body",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/authRouter.loginBody"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User profile data",
                        "schema": {
                            "$ref": "#/definitions/dbClient.User"
                        }
                    },
                    "400": {
                        "description": "Invalid request",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal server error if server fails",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        },
        "/auth/sign-up": {
            "post": {
                "description": "Sign up",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Auth"
                ],
                "summary": "Sign up",
                "parameters": [
                    {
                        "description": "Sign up object",
                        "name": "body",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/authRouter.signUpBody"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "User profile data",
                        "schema": {
                            "$ref": "#/definitions/dbClient.User"
                        }
                    },
                    "400": {
                        "description": "Invalid request",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal server error if server fails",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        },
        "/profile": {
            "get": {
                "description": "This endpoint retrieves the user profile information from the Auth0 Management API using the user's ID from the session. The ID is obtained from the session and used to query the user data from the external identity provider (Auth0). The user must be authenticated, and a valid session must exist.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Profile"
                ],
                "summary": "Get current user profile",
                "responses": {
                    "200": {
                        "description": "User profile data",
                        "schema": {
                            "$ref": "#/definitions/dbClient.User"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "User not found in database",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal server error if server fails",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            },
            "patch": {
                "description": "This endpoint updates the user profile information in the Auth0 Management API using the user's ID from the session. The ID is obtained from the session and used to query the user data from the external identity provider (Auth0). The user must be authenticated, and a valid session must exist. The request body must contain valid JSON data representing the user profile information.",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Profile"
                ],
                "summary": "Update current user profile",
                "parameters": [
                    {
                        "description": "User profile data",
                        "name": "user",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/profileRouter.patchProfileBody"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User profile data",
                        "schema": {
                            "$ref": "#/definitions/dbClient.User"
                        }
                    },
                    "400": {
                        "description": "Invalid request",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "User not found in Auth0 database",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "429": {
                        "description": "Rate limit exceeded",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal server error if request to Auth0 fails",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        },
        "/profile/avatar": {
            "patch": {
                "description": "This endpoint uploads the user avatar image to the image storage service and updates the user profile information in the Auth0 Management API using the user's ID from the session. The ID is obtained from the session and used to query the user data from the external identity provider (Auth0). The user must be authenticated, and a valid session must exist. The request body must contain a valid image file.",
                "consumes": [
                    "multipart/form-data"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Profile"
                ],
                "summary": "Upload user avatar",
                "parameters": [
                    {
                        "type": "file",
                        "description": "User avatar image file",
                        "name": "file",
                        "in": "formData",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "X coordinate of the crop area",
                        "name": "x",
                        "in": "formData",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "Y coordinate of the crop area",
                        "name": "y",
                        "in": "formData",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "Width of the crop area",
                        "name": "width",
                        "in": "formData",
                        "required": true
                    },
                    {
                        "type": "string",
                        "description": "Height of the crop area",
                        "name": "height",
                        "in": "formData",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User profile data",
                        "schema": {
                            "$ref": "#/definitions/dbClient.User"
                        }
                    },
                    "400": {
                        "description": "Invalid request",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "User not found in Auth0 database",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "429": {
                        "description": "Rate limit exceeded",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal server error if request to Auth0 fails",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        },
        "/profile/email": {
            "patch": {
                "description": "Update email of the current user",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Profile"
                ],
                "summary": "Change user email",
                "parameters": [
                    {
                        "description": "User email",
                        "name": "email",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/profileRouter.changeEmailBody"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "User profile data",
                        "schema": {
                            "$ref": "#/definitions/dbClient.User"
                        }
                    },
                    "400": {
                        "description": "Email is invalid or missing",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "User not found in database",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal server error if server fails",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        },
        "/tasks": {
            "get": {
                "description": "Get a list of tasks created by user with the given ID. If no ID is provided, the ID of the currently logged in user is used",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Tasks"
                ],
                "summary": "Get a list of tasks",
                "parameters": [
                    {
                        "type": "string",
                        "description": "ID of the user who created the tasks",
                        "name": "owner_id",
                        "in": "query"
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/tasksRouter.groupedByStatusTasks"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            },
            "post": {
                "description": "Create a new task",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Tasks"
                ],
                "summary": "Create a new task",
                "parameters": [
                    {
                        "description": "Task object that needs to be created",
                        "name": "task",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/tasksRouter.createTaskBody"
                        }
                    }
                ],
                "responses": {
                    "201": {
                        "description": "Created",
                        "schema": {
                            "$ref": "#/definitions/dbClient.Task"
                        }
                    },
                    "400": {
                        "description": "Bad Request",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        },
        "/tasks/{id}": {
            "get": {
                "description": "Get a task",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Tasks"
                ],
                "summary": "Get a task",
                "parameters": [
                    {
                        "type": "string",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dbClient.Task"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "Not Found",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            },
            "put": {
                "description": "Update a task",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Tasks"
                ],
                "summary": "Update a task",
                "parameters": [
                    {
                        "type": "string",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "description": "Task object that needs to be updated",
                        "name": "task",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/tasksRouter.updateTaskBody"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dbClient.Task"
                        }
                    },
                    "400": {
                        "description": "Bad Request",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "Not Found",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            },
            "delete": {
                "description": "Delete a task",
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Tasks"
                ],
                "summary": "Delete a task",
                "parameters": [
                    {
                        "type": "string",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dbClient.Task"
                        }
                    },
                    "401": {
                        "description": "Unauthorized",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "Not Found",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        },
        "/tasks/{id}/status": {
            "patch": {
                "description": "Change task status",
                "consumes": [
                    "application/json"
                ],
                "produces": [
                    "application/json"
                ],
                "tags": [
                    "Tasks"
                ],
                "summary": "Change task status",
                "parameters": [
                    {
                        "type": "integer",
                        "description": "Task ID",
                        "name": "id",
                        "in": "path",
                        "required": true
                    },
                    {
                        "description": "Task status. Must be one of: not_done, in_progress, done",
                        "name": "status",
                        "in": "body",
                        "required": true,
                        "schema": {
                            "$ref": "#/definitions/tasksRouter.changeTaskStatusBody"
                        }
                    }
                ],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {
                            "$ref": "#/definitions/dbClient.Task"
                        }
                    },
                    "400": {
                        "description": "Bad Request",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "401": {
                        "description": "Unauthorized if session is missing or invalid",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "404": {
                        "description": "Not Found",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    },
                    "500": {
                        "description": "Internal Server Error",
                        "schema": {
                            "$ref": "#/definitions/errorHandlers.Error"
                        }
                    }
                }
            }
        }
    },
    "definitions": {
        "authRouter.loginBody": {
            "type": "object",
            "required": [
                "email",
                "password"
            ],
            "properties": {
                "email": {
                    "type": "string"
                },
                "password": {
                    "type": "string"
                }
            }
        },
        "authRouter.signUpBody": {
            "type": "object",
            "required": [
                "email",
                "password",
                "username"
            ],
            "properties": {
                "email": {
                    "type": "string"
                },
                "password": {
                    "type": "string"
                },
                "username": {
                    "type": "string"
                }
            }
        },
        "dbClient.Task": {
            "type": "object",
            "properties": {
                "assignedTo": {
                    "type": "string"
                },
                "createdAt": {
                    "type": "string"
                },
                "deletableNotByOwner": {
                    "type": "boolean"
                },
                "deletedAt": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "dueDate": {
                    "type": "string"
                },
                "id": {
                    "type": "string"
                },
                "owner_id": {
                    "type": "string"
                },
                "status": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "updatedAt": {
                    "type": "string"
                }
            }
        },
        "dbClient.User": {
            "type": "object",
            "properties": {
                "createdAt": {
                    "type": "string"
                },
                "deletedAt": {
                    "type": "string"
                },
                "email": {
                    "type": "string"
                },
                "email_verified": {
                    "type": "boolean"
                },
                "id": {
                    "type": "string"
                },
                "last_login": {
                    "type": "string"
                },
                "last_password_reset": {
                    "type": "string"
                },
                "picture": {
                    "type": "string"
                },
                "updatedAt": {
                    "type": "string"
                },
                "username": {
                    "type": "string"
                }
            }
        },
        "errorHandlers.Error": {
            "type": "object",
            "properties": {
                "details": {},
                "error": {
                    "type": "string"
                },
                "errorCode": {
                    "type": "string"
                },
                "message": {
                    "type": "string"
                },
                "statusCode": {
                    "type": "integer"
                }
            }
        },
        "profileRouter.changeEmailBody": {
            "type": "object",
            "required": [
                "email"
            ],
            "properties": {
                "email": {
                    "type": "string"
                }
            }
        },
        "profileRouter.patchProfileBody": {
            "type": "object",
            "required": [
                "username"
            ],
            "properties": {
                "username": {
                    "type": "string"
                }
            }
        },
        "tasksRouter.changeTaskStatusBody": {
            "type": "object",
            "required": [
                "status"
            ],
            "properties": {
                "status": {
                    "type": "string",
                    "enum": [
                        "not_done",
                        "in_progress",
                        "done"
                    ]
                }
            }
        },
        "tasksRouter.createTaskBody": {
            "type": "object",
            "required": [
                "status",
                "title"
            ],
            "properties": {
                "assignedTo": {
                    "type": "string"
                },
                "deletableNotByOwner": {
                    "type": "boolean"
                },
                "description": {
                    "type": "string",
                    "maxLength": 255
                },
                "dueDate": {
                    "type": "string"
                },
                "status": {
                    "type": "string"
                },
                "title": {
                    "type": "string",
                    "maxLength": 63
                }
            }
        },
        "tasksRouter.groupedByStatusTasks": {
            "type": "object",
            "additionalProperties": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/dbClient.Task"
                }
            }
        },
        "tasksRouter.updateTaskBody": {
            "type": "object",
            "properties": {
                "assignedTo": {
                    "type": "string"
                },
                "deletableNotByOwner": {
                    "type": "boolean"
                },
                "description": {
                    "type": "string",
                    "maxLength": 255
                },
                "dueDate": {
                    "type": "string"
                },
                "status": {
                    "type": "string",
                    "enum": [
                        "not_done",
                        "in_progress",
                        "done"
                    ]
                },
                "title": {
                    "type": "string",
                    "maxLength": 63
                }
            }
        }
    }
}`

// SwaggerInfo holds exported Swagger Info so clients can modify it
var SwaggerInfo = &swag.Spec{
	Version:          "",
	Host:             "",
	BasePath:         "",
	Schemes:          []string{},
	Title:            "",
	Description:      "",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
	LeftDelim:        "{{",
	RightDelim:       "}}",
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
