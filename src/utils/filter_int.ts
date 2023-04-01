export function filterInt(value: string | null) {
    if (value && /[0-9]$/.test(value))
        return Number(value)
    return NaN
}