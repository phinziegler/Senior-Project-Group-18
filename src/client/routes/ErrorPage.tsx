import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
    const error: any = useRouteError();   // for some reason useRouteError does not specify a return type :(

    return (
        <div className="vh-100">
            <div className="center-vertical text-center position-relative" id="error-page">
                <h1>404</h1>
                <p>Sorry, an unexpected error has occurred.</p>
                <p className="text-secondary">
                    <i>{error.statusText || error.message}</i>
                </p>
            </div>
        </div>
    );
}