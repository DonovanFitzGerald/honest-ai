export const redirectToDashboardIfForbidden = async (
    response: Response,
): Promise<boolean> => {
    if (response.status !== 403) {
        return false;
    }

    try {
        const payload = (await response.clone().json()) as {
            redirect?: string;
        };

        if (typeof payload.redirect === 'string' && payload.redirect) {
            window.location.assign(payload.redirect);
            return true;
        }
    } catch {
        // Ignore malformed error payloads and let the normal error path run.
    }

    return false;
};
