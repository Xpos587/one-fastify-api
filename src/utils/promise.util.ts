export async function delay(ms: number): Promise<boolean> {
    return new Promise(resolve => {
        setTimeout(() => resolve(true), ms);
    });
};