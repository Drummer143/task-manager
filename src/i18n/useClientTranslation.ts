"use client";

import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import { getOptions, settings } from "./settings";
import { initReactI18next, useTranslation as useTranslationOrg } from "react-i18next";

const runsOnServerSide = typeof window === "undefined";

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)))
    .init({
        ...getOptions(),
        lng: undefined, // let detect the language on client side
        detection: {
            order: ["path", "htmlTag", "cookie", "navigator"]
        },
        preload: runsOnServerSide ? settings.locales : []
    });

export function useClientTranslation(lng: I18NLocale, ns: string, keyPrefix?: string) {
    const [cookies, setCookie] = useCookies([settings.cookieName]);
    const ret = useTranslationOrg(ns, { keyPrefix });
    const { i18n } = ret;

    if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
        i18n.changeLanguage(lng);
    } else {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [activeLng, setActiveLng] = useState(i18n.resolvedLanguage);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (activeLng === i18n.resolvedLanguage) return;
            setActiveLng(i18n.resolvedLanguage);
        }, [activeLng, i18n.resolvedLanguage]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (!lng || i18n.resolvedLanguage === lng) return;
            i18n.changeLanguage(lng);
        }, [lng, i18n]);

        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
            if (cookies.app_lng === lng) return;
            setCookie(settings.cookieName, lng, { path: "/" });
        }, [lng, cookies.app_lng, setCookie]);
    }
    return ret;
}