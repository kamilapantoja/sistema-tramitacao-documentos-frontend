import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { useEffect, useRef, useState } from "react";
import DocumentService from "../service/documentService";
// import { Documento } from "./model/documento";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { FilterMatchMode } from "primereact/api";
import { DocumentDialog } from "../components/DocumentDialog";
import { Toast } from "primereact/toast";
import { DocumentoRow } from "../model/DocumentRow";
import { DocumentActions } from "../components/DocumentActions";
import { TramitarDialog } from "../components/TramitarDialogo";
import { HistoricoDialog } from "../components/HistoricoDialog";

function GerenciamentoDeDocumentos() {
    // const [documentos, setDocumentos] = useState<Documento[]>();
    const [documentosRows, setDocumentosRows] = useState<DocumentoRow[]>();
    const [loading, setLoading] = useState(false);
    const [documentoDialogVisivel, setDocumentoDialogVisivel] = useState(false);
    const [tramitacaoDialogVisivel, setTramitacaoDialogVisivel] =
        useState(false);
    const [historicoDialogVisivel, setHistoricoDialogVisivel] = useState(false);
    const toast = useRef<Toast>(null);
    const [filters] = useState({
        nroDocumento: { value: null, matchMode: FilterMatchMode.CONTAINS },
        titulo: { value: null, matchMode: FilterMatchMode.CONTAINS },
        setorEnvio: { value: null, matchMode: FilterMatchMode.CONTAINS },
        dataEnvio: { value: null, matchMode: FilterMatchMode.CONTAINS },
        dataRecebimento: { value: null, matchMode: FilterMatchMode.CONTAINS },
        anexo: { value: null, matchMode: FilterMatchMode.EQUALS },
    });
    const [editDoc, setEditingDoc] = useState<DocumentoRow>();

    const documentService = new DocumentService();

    /*const hasAttachmentFilterTemplate = (
        options: ColumnFilterElementTemplateOptions
    ) => {
        return (
            <TriStateCheckbox
                value={options.value}
                onChange={(e) => options.filterApplyCallback(e.value)}
            />
        );
    };*/

    useEffect(() => {
        loadDocuments(); // <- async
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        const response = await documentService.getDocuments();
        // setDocumentos(response);
        setDocumentosRows(
            response.map((d) => {
                // TODO revisar tramitation
                const mostRecentTramitation =
                    documentService.getTramitacaoMaisRecente(d);
                return {
                    ...d,
                    tramitacaoMaisRecente: mostRecentTramitation,
                };
            })
        );
        setLoading(false);
    };

    const formatDate = (date?: string) => {
        if (!date) {
            return "";
        }
        return new Date(date).toLocaleDateString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleCreateButton = () => {
        setEditingDoc(undefined);
        setDocumentoDialogVisivel(true);
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

    const updateSuccess = () => {
        toast.current?.show({
            severity: "success",
            summary: "Documento Atualizado",
            detail: "Documento atualizado com sucesso",
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

    const onHistorico = (doc: DocumentoRow) => {
        setEditingDoc(doc);
        setHistoricoDialogVisivel(true);
    };

    const documentActions = (doc: DocumentoRow) => {
        return (
            <DocumentActions
                doc={doc}
                onDelete={onDeleteDoc}
                onEdit={onEditDoc}
                onEnviar={onEnviarAcao}
                onReceber={onReceberAcao}
                onHistorico={onHistorico}
            />
        );
    };

    const onEnviadoSucesso = () => {
        toast.current?.show({
            severity: "success",
            summary: "Documento Enviado",
            detail: "Documento enviado com sucesso",
            life: 3000,
        });
        loadDocuments(); // <- async
    };

    const onRecebidoSucesso = () => {
        toast.current?.show({
            severity: "success",
            summary: "Documento Recebido",
            detail: "Documento reebido com sucesso",
            life: 3000,
        });
        loadDocuments(); // <- async
    };

    const onEnviarAcao = (doc: DocumentoRow) => {
        setEditingDoc(doc);
        setTramitacaoDialogVisivel(true);
    };

    const onReceberAcao = onEnviarAcao;

    const onTramitacaoError = () => {
        toast.current?.show({
            severity: "error",
            summary: "Falha ao Tramitar o documento",
            life: 3000,
        });
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
        setDocumentoDialogVisivel(true);
    };

    return (
        <Card
            title="Gerenciamento de Documentos"
            className="gerencia-documentos"
        >
            <Toast ref={toast} />
            <DocumentDialog
                visible={documentoDialogVisivel}
                onHide={() => setDocumentoDialogVisivel(false)}
                createSuccess={createSuccess}
                createError={createError}
                updateSuccess={updateSuccess}
                document={editDoc}
            />
            <TramitarDialog
                visivel={tramitacaoDialogVisivel}
                onHide={() => setTramitacaoDialogVisivel(false)}
                recebidoSuccesso={onRecebidoSucesso}
                enviadoSuccesso={onEnviadoSucesso}
                tramitarError={onTramitacaoError}
                documento={editDoc}
            />
            <HistoricoDialog
                visivel={historicoDialogVisivel}
                onHide={() => setHistoricoDialogVisivel(false)}
                documento={editDoc}
            />
            <p>Documentos</p>
            <Button onClick={handleCreateButton} className="mb-2">
                Cadastrar
            </Button>
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
                    body={(doc: DocumentoRow) =>
                        formatDate(doc.tramitacaoMaisRecente?.dataHoraEnvio)
                    }
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
                        formatDate(doc.tramitacaoMaisRecente?.dataHoraRecebido)
                    }
                    header="Data Hora - Recebimento"
                    filter
                />
                <Column
                    header="Anexo"
                    field="anexo"
                    // filter
                    // filterElement={hasAttachmentFilterTemplate}
                    body={(doc) => attatchmentButtonIfHas(doc)}
                    dataType="boolean"
                />
                <Column header="Ações" body={documentActions} />
            </DataTable>
        </Card>
    );
}

export default GerenciamentoDeDocumentos;
