import "./App.css";
import GerenciamentoDeDocumentos from "./pages/GerenciamentoDeDocumentos";
import { Sidebar } from "primereact/sidebar";
import { AppToolbar } from "./components/AppToolbar";
import { Link, Route, Routes } from "react-router";
import { useState } from "react";
import { GerenciadorDeSetor } from "./pages/GerenciadorDeSetor";
function App() {
    const [menuVisivel, setMenuVisivel] = useState(false);
    return (
        <>
            <Sidebar visible={menuVisivel} onHide={() => setMenuVisivel(false)}>
                <Link to="/">
                    <div className="menu-item">
                        Documentos <i className="pi pi-arrow-right" />
                    </div>
                </Link>
                <Link to="/setores">
                    <div className="menu-item">
                        Setor <i className="pi pi-arrow-right" />
                    </div>
                </Link>
            </Sidebar>
            <AppToolbar toogleMenuVisivel={() => setMenuVisivel((v) => !v)} />
            <div className="kamicontainer my-4">
                <Routes>
                    <Route index element={<GerenciamentoDeDocumentos />} />
                    <Route path="/setores" element={<GerenciadorDeSetor />} />
                    {/* <Route index element={<GerenciamentoDeDocumentos />} /> */}
                </Routes>
            </div>
        </>
    );
}

export default App;
