import { Dialog } from "primereact/dialog";
import { DocumentoRow } from "../model/DocumentRow";

interface HistoricoDialogProps {
    visivel: boolean;
    onHide: () => void;
    documento?: DocumentoRow;
}
export const HistoricoDialog = ({
    visivel = false,
    onHide,
    documento,
}: HistoricoDialogProps) => {
    const formatDate = (date?: string) => {
        if (!date) {
            return "";
        }
        return new Date(date).toLocaleDateString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog
            visible={visivel}
            onHide={onHide}
            header={`${`Historico do documento - ${documento?.titulo}`} Documento`}
            className="tramitacao-dialog formulario"
        >
            {documento?.tramitacoes
                .sort((a, b) => {
                    return (
                        new Date(a.dataHoraEnvio).getTime() -
                        new Date(b.dataHoraEnvio).getTime()
                    );
                })
                .map((tramitacao) => {
                    return (
                        <div className="my-2">
                            <span>
                                <span className="historico-setor-nome">
                                    {tramitacao.setorEnvia.descSetor}
                                </span>{" "}
                                ({formatDate(tramitacao.dataHoraEnvio)})
                            </span>
                            <i className="pi pi-arrow-right mx-4"></i>
                            <span>
                                <span className="historico-setor-nome">
                                    {tramitacao.setorRecebe.descSetor}
                                </span>{" "}
                                (
                                {tramitacao.dataHoraRecebido
                                    ? formatDate(tramitacao.dataHoraRecebido)
                                    : "Não recebido"}
                                )
                            </span>
                        </div>
                    );
                })}
        </Dialog>
    );
};
