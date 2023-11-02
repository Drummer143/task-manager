import { useCallback, useEffect, useState } from "react";

interface UseLocalStorageReturnValue<T = any> {
    value: T,
    setValue: TransformFunction<T>;
}

export const useLocalStorage = <T = any>(key: string, defaultValue: T): UseLocalStorageReturnValue<T> => {
    const [value, setValue] = useState<T>(defaultValue);

    const updateValue = useCallback<UseLocalStorageReturnValue["setValue"]>((newValue: T) => {
        if (!global.localStorage) {
            return;
        }

        try {
            if (typeof newValue === "function") {
                setValue(prev => {
                    const result = newValue(prev);

                    localStorage.setItem(key, JSON.stringify(result));

                    return newValue;
                });
            } else {
                setValue(newValue);
                localStorage.setItem(key, JSON.stringify(newValue));
            }
        } catch (error) {
            console.error(error);
        }
    }, [key]);

    useEffect(() => {
        if (!global.localStorage) {
            return;
        }

        const stringValue = localStorage.getItem(key);

        if (stringValue) {
            setValue(JSON.parse<T>(stringValue));
        }
    }, [key]);

    return {
        value,
        setValue: updateValue
    };
};
