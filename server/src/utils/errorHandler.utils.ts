const errorHandler = (fileLocation: string, err: any) => {
    if (err instanceof Error) {
        console.error(knownError(fileLocation, err));
        return knownError(fileLocation, err);
    } else {
        console.error(unknownError(fileLocation));
        return unknownError(fileLocation);
    };
}

const knownError = (fileLocation: string, err: Error) => {
    return `${fileLocation} :: Error -> ${err}`;
};

const unknownError = (fileLocation: string) => {
    return `${fileLocation} :: Unknown error`;
};

export default errorHandler;
export { knownError, unknownError };