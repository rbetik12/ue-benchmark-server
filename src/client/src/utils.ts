export const checkAuth = async () => {
    try {
        const response = await fetch(`/api/auth/check`);
        if (!response.ok) {
          throw new Error('Failed to change run info');
        }

        if (response.status === 201) {
            return true;
        }
    } catch (error) {
        console.error(error);
    }

    console.debug("Cookie expired!");
    return false;
}

export const auth = async () => {
    try {
        const response = await fetch(`/api/auth/`, {
            method: 'POST'
        });
        if (!response.ok) {
          throw new Error('Failed to change run info');
        }
    } catch (error) {
        console.error(error);
    }
}