export function validateRequired(field: string, value: any): string[] {
    const isBlank =
        !value || (value.length !== undefined && value.length === 0) || (value.strip !== undefined && !value.strip());

    return isBlank ? ["cannotBeEmpty"] : [];
}
