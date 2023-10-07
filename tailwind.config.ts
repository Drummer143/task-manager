import type { Config } from "tailwindcss";
import type plugin from "tailwindcss/plugin";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            transitionProperty: {
                "bg": "background-color"
            }
        }
    },
    plugins: [
        {
            handler: ({ matchUtilities, theme }) => {
                matchUtilities(
                    {
                        "grid-area": (value, { modifier }) => {

                            // if there are both value and modifier
                            // modifier will override value anyway
                            // `grid-area-[header]/footer` will generate `grid-area: footer`
                            if (modifier !== null) {
                                value = modifier;
                            }

                            return {
                                "grid-area": value
                            };
                        }
                    },
                    {
                        values: Object.assign(theme("gridArea", {}), {
                            DEFAULT: "[]"
                        }),
                        modifiers: "any"
                    }
                );

                matchUtilities(
                    {
                        "grid-areas": (value) => ({
                            "grid-template-areas": value
                        })
                    },
                    {
                        values: Object.assign(theme("gridAreas", {}), {
                            DEFAULT: "[]"
                        }),
                        modifiers: "any"
                    }
                );
            }
        }
    ]
};

export default config;
