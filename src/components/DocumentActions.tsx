import { useMemo } from "react";
import { DocumentoRow } from "../model/DocumentRow";
import { Button } from "primereact/button";
import DocumentService from "../service/documentService";

export interface DocumentActionsProps {
    doc: DocumentoRow;
    onDelete: (doc: DocumentoRow) => void;
    onEdit: (doc: DocumentoRow) => void;
    onEnviar: (doc: DocumentoRow) => void;
    onReceber: (doc: DocumentoRow) => void;
    onHistorico: (doc: DocumentoRow) => void;
}

export const DocumentActions = ({
    doc,
    onDelete,
    onEdit,
    onEnviar,
    onReceber,
    onHistorico,
}: DocumentActionsProps) => {
    const documentService = new DocumentService();
    const naoTramitado = useMemo(() => {
        return !doc.tramitacoes || doc.tramitacoes.length == 0;
    }, [doc]);
    const recebido = useMemo(() => {
        return !!(
            doc.tramitacoes &&
            documentService.getTramitacaoMaisRecente(doc)?.dataHoraRecebido
        );
    }, [doc]);
    return (
        <>
            <div className="flex">
                {recebido || naoTramitado ? (
                    <Button
                        icon="pi pi-arrow-up"
                        text
                        onClick={() => onEnviar(doc)}
                    />
                ) : (
                    <Button
                        icon="pi pi-arrow-down"
                        text
                        onClick={() => onReceber(doc)}
                    />
                )}
                {naoTramitado ? (
                    <>
                        <Button
                            icon="pi pi-pencil"
                            text
                            onClick={() => onEdit(doc)}
                        />
                        <Button
                            icon="pi pi-trash"
                            text
                            onClick={() => onDelete(doc)}
                        />
                    </>
                ) : (
                    <Button
                        icon="pi pi-eye"
                        text
                        onClick={() => onHistorico(doc)}
                    />
                )}
            </div>
        </>
    );
};
