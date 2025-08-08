pub struct Initial {
    pub position: i32,
    pub initial: bool,
    pub localizations: &'static [(&'static str, &'static str)],
}

pub const INIT_BOARD_STATUSES: [Initial; 3] = [
    Initial {
        position: 1,
        initial: true,
        localizations: &[("en", "To Do")],
    },
    Initial {
        position: 2,
        initial: false,
        localizations: &[("en", "In Progress")],
    },
    Initial {
        position: 3,
        initial: false,
        localizations: &[("en", "Done")],
    },
];
