use rust_api::entities::board_statuses::model::BoardStatusType;

pub struct Initial {
    pub code: &'static str,
    pub position: i32,
    pub r#type: BoardStatusType,
    pub initial: bool,
    pub localizations: &'static [(&'static str, &'static str)],
}

pub const INIT_BOARD_STATUSES: [Initial; 3] = [
    Initial {
        code: "to_do",
        position: 1,
        r#type: BoardStatusType::MainStatus,
        initial: true,
        localizations: &[("en", "To Do")],
    },
    Initial {
        code: "in_progress",
        position: 2,
        r#type: BoardStatusType::MainStatus,
        initial: false,
        localizations: &[("en", "In Progress")],
    },
    Initial {
        code: "done",
        position: 3,
        r#type: BoardStatusType::MainStatus,
        initial: false,
        localizations: &[("en", "Done")],
    },
];
