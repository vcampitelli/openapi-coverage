interface RouteFilterInterface {
    filter: (method: string, uri: string) => boolean;
}

export default RouteFilterInterface;
