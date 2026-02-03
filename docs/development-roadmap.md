# Development Roadmap

Priority-ordered list of features to implement for comfortable daily use.

## High Priority

### 1. Finish attachments

- **Status**: In progress
- **Effort**: High

### 2. Task Deletion from UI

- **Status**: Not implemented
- **Effort**: Low (~15 min)
- **Details**: Backend API `deleteTask` exists. Need to add "Delete" option to TaskItem context menu.

### 3. Task Grouping (Sprints/Backlog/Subtasks)

- **Status**: Not implemented
- **Effort**: Medium
- **Options to consider**:
    - **Subtasks**: Add `parent_task_id` to tasks table, render as nested items
    - **Sprints**: Create `sprints` table with `start_date`, `end_date`, link tasks via `sprint_id`
    - **Simple backlog**: Add boolean `is_backlog` flag or special "Backlog" status
- **Recommendation**: Start with subtasks — simplest schema change, most flexible

### 4. Task Filtering & Search

- **Status**: Not implemented
- **Effort**: Medium
- **Features needed**:
    - Filter by assignee
    - Filter by due date (overdue, today, this week)
    - Search by title
    - Filter by priority (once implemented)

### 5. Task Priorities

- **Status**: Not implemented
- **Effort**: Low-Medium
- **Details**: Add `priority` field to tasks (e.g., `low`, `medium`, `high`, `critical`). Display as colored indicator on task cards.

## Medium Priority

### 6. Labels/Tags

- **Status**: Not implemented
- **Effort**: Medium
- **Details**: Many-to-many relationship. Useful for categorization (bug, feature, refactor, docs).

### 7. Due Date Visualization

- **Status**: Partially implemented (data exists, no visual indicator)
- **Effort**: Low
- **Details**: Highlight overdue tasks in red, upcoming deadlines in yellow.

### 7. Task History

- **Status**: Code exists but commented out
- **Effort**: Low (uncommenting + testing)
- **Location**: `apps/frontend/task-manager/src/pages/page/BoardPage/widgets/TaskHistory/`

## Low Priority / Not Needed

- ~~Mobile layout~~ — Local development only
- ~~Notifications~~ — Single user, not needed
- ~~Bulk operations~~ — Low task volume expected

## Quick Wins

These can be done in under an hour each:

1. Add "Delete" to TaskItem context menu
2. Show due date on task cards
3. CSS highlighting for overdue tasks
