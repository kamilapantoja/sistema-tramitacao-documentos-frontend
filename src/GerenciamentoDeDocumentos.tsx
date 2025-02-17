import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { useEffect, useRef, useState } from "react";
import DocumentService from "./service/documentService";
import { Documento } from "./model/documento";
import { Column, ColumnFilterElementTemplateOptions } from "primereact/column";
import { Tramitacao } from "./model/tramitacao";
import { Button } from "primereact/button";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { FilterMatchMode } from "primereact/api";
import { DocumentDialog } from "./components/DocumentDialog";
import { Toast } from "primereact/toast";
import { DocumentoRow } from "./model/DocumentRow";
import { DocumentActions } from "./components/DocumentActions";

function GerenciamentoDeDocumentos() {
    const [documentos, setDocumentos] = useState<Documento[]>();
    const [documentosRows, setDocumentosRows] = useState<DocumentoRow[]>();
    const [loading, setLoading] = useState(false);
    const [documentDialogVisible, setDocumentDialogVisible] = useState(false);
    const toast = useRef<Toast>(null);
    const [filters, setFilters] = useState({
        nroDocumento: { value: null, matchMode: FilterMatchMode.CONTAINS },
        titulo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        setorEnvio: { value: null, matchMode: FilterMatchMode.CONTAINS },
        dataEnvio: { value: null, matchMode: FilterMatchMode.CONTAINS },
        dataRecebimento: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });
    const [editDoc, setEditingDoc] = useState<DocumentoRow>();

    const documentService = new DocumentService();

    const hasAttachmentFilterTemplate = (
        options: ColumnFilterElementTemplateOptions
    ) => {
        return (
            <TriStateCheckbox
                value={options.value}
                onChange={(e) => options.filterApplyCallback(e.value)}
            />
        );
    };

    useEffect(() => {
        loadDocuments(); // <- async
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        const response = await documentService.getDocuments();
        setDocumentos(response);
        setDocumentosRows(
            response.map((d) => {
                let mostRecentTramitation: Tramitacao | undefined;
                let biggerDate: number | undefined;
                for (const tramitacao of d.tramitacoes) {
                    const dataHoraStr =
                        tramitacao.dataHoraRecebido ?? tramitacao.dataHoraEnvio;
                    const dataHora = dataHoraStr
                        ? new Date(dataHoraStr).getTime()
                        : undefined;
                    if (
                        mostRecentTramitation == null ||
                        (dataHora != null && biggerDate! < dataHora)
                    ) {
                        mostRecentTramitation = tramitacao;
                        biggerDate = dataHora;
                    }
                }
                return {
                    ...d,
                    setorEnvio: mostRecentTramitation?.setorEnvia.descSetor,
                    dataEnvio: mostRecentTramitation?.dataHoraEnvio
                        ? new Date(mostRecentTramitation?.dataHoraEnvio)
                        : undefined,
                    setorRecebimento:
                        mostRecentTramitation?.setorRecebe.descSetor,
                    dataRecebimento: mostRecentTramitation?.dataHoraRecebido
                        ? new Date(mostRecentTramitation?.dataHoraRecebido)
                        : undefined,
                };
            })
        );
        setLoading(false);
    };

    const formatDate = (date?: Date) => {
        return date?.toLocaleDateString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleCreateButton = () => {
        setEditingDoc(undefined);
        setDocumentDialogVisible(true);
    };

    const createSuccess = () => {
        toast.current?.show({
            severity: "success",
            summary: "Documento criado",
            detail: "Documento criado com sucesso",
            life: 3000,
        });
        loadDocuments(); // <- async
    };

    const createError = () => {
        toast.current?.show({
            severity: "error",
            summary: "Falha ao criar o documento",
            life: 3000,
        });
    };

    const attatchmentButtonIfHas = (doc: DocumentoRow) => {
        return (
            <Button
                icon="pi pi-file-pdf"
                text
                onClick={() =>
                    handleDownloadFile(doc.pathArquivoPDF, doc.prettyName)
                }
            />
        );
    };

    const handleDownloadFile = async (filepath: string, prettyName: string) => {
        await documentService.downloadFile(filepath, prettyName);
    };

    const documentActions = (doc: DocumentoRow) => {
        return (
            <DocumentActions
                doc={doc}
                onDelete={onDeleteDoc}
                onEdit={onEditDoc}
            />
        );
    };

    const onDeleteDoc = async (doc: DocumentoRow) => {
        try {
            await documentService.deleteDoc(doc.id);
            toast.current?.show({
                severity: "success",
                summary: "Documento Deletado",
                detail: "Documento deletado com sucesso",
                life: 3000,
            });
            await loadDocuments();
        } catch (err) {
            toast.current?.show({
                severity: "error",
                summary: "Falha ao deletar documento",
                life: 3000,
            });
        }
    };
    const onEditDoc = (doc: DocumentoRow) => {
        setEditingDoc(doc);
        setDocumentDialogVisible(true);
    };

    return (
        <Card title="Gerenciamento de Documentos">
            <Toast ref={toast} />
            <DocumentDialog
                visible={documentDialogVisible}
                onHide={() => setDocumentDialogVisible(false)}
                createSuccess={createSuccess}
                createError={createError}
                document={editDoc}
            />
            <p>Documentos</p>
            <Button onClick={handleCreateButton}>Cadastrar</Button>
            <DataTable
                loading={loading}
                value={documentosRows}
                filterDisplay="row"
                filters={filters}
                filterIcon={[]}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
            >
                <Column field="nroDocumento" header="N° Documento" filter />
                <Column field="titulo" header="Titulo" filter />
                <Column field="setorEnvio" header="Setor Envio" filter />
                <Column
                    field="dataEnvio"
                    body={(doc: DocumentoRow) => formatDate(doc.dataEnvio)}
                    header="Data Hora - Envio"
                    filter
                />
                <Column
                    field="setorRecebimento"
                    header="Setor Recebimento"
                    filter
                />
                <Column
                    field="dataRecebimento"
                    body={(doc: DocumentoRow) =>
                        formatDate(doc.dataRecebimento)
                    }
                    header="Data Hora - Recebimento"
                    filter
                />
                <Column
                    header="Anexo"
                    filter
                    filterElement={hasAttachmentFilterTemplate}
                    body={(doc) => attatchmentButtonIfHas(doc)}
                />
                <Column header="Ações" body={documentActions} />
            </DataTable>
        </Card>
    );
}

export default GerenciamentoDeDocumentos;
