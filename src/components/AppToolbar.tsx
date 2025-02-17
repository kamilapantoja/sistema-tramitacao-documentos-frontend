import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";

export interface AppToolbarProps {
    toogleMenuVisivel: () => void;
}
export const AppToolbar = ({ toogleMenuVisivel }: AppToolbarProps) => {
    return (
        <div style={{ backgroundColor: "rgb(34,46,120)" }}>
            <div className="kamicontainer py-3">
                <Toolbar
                    start={
                        <Button
                            icon="pi pi-bars"
                            text
                            onClick={toogleMenuVisivel}
                            style={{
                                color: "white",
                                backgroundColor: "transparent",
                                border: "none",
                                fontSize: 18,
                            }}
                            rounded
                        />
                    }
                    end={
                        <>
                            <span style={{ color: "white" }}>
                                João da silva
                            </span>
                            <Avatar
                                size="large"
                                label="J"
                                style={{
                                    backgroundColor: "rgb(20, 182, 213)",
                                    color: "white",
                                    marginLeft: 10,
                                }}
                                shape="circle"
                            />
                        </>
                    }
                />
            </div>
        </div>
    );
};
