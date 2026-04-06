/// <reference types="react" />

declare module "@dhis2/ui" {
    export function HeaderBar(props: { className?: string; appName?: string }): React.ReactElement;
}

/** @dhis2/d2-ui-core / @dhis2/d2-ui-forms ship no .d.ts; minimal typings for ESM imports (Vite). */
declare module "@dhis2/d2-ui-core" {
    export const TextField: React.ComponentType<Record<string, unknown>>;
    export const DropDown: React.ComponentType<Record<string, unknown>>;
}

declare module "@dhis2/d2-ui-forms" {
    export const FormBuilder: React.ComponentType<Record<string, unknown>>;
    export const Validators: { isRequired: (value: unknown) => boolean; [key: string]: unknown };
}
