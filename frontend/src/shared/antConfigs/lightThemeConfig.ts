import { ThemeConfig } from "antd";

export default {
    cssVar: true,
    components: {
        Layout: {
            triggerColor: '#000',
            triggerBg: '#f5f5f5',
            headerBg: '#fafafa',
            siderBg: '#fafafa',
        },

    },
    token: {
        colorBgLayout: '#fff',
    }
} as Omit<ThemeConfig, 'algorithm'>