import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import DocumentService from "../service/documentService";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TipoDocumento } from "../model/tipoDocumento";
import { Dropdown } from "primereact/dropdown";
import { CreateDocumentoDTO } from "../model/createDocumentoDto";
import { Message } from "primereact/message";
import { DocumentoRow } from "../model/DocumentRow";
import { Setor } from "../model/setor";
import SetorService from "../service/setorService";
import { TramitacaoSetores } from "../model/tramitacaoSetores";

interface TramitarDialogProps {
    visivel: boolean;
    onHide: () => void;
    recebidoSuccesso: () => void;
    enviadoSuccesso: () => void;
    tramitarError: () => void;
    documento?: DocumentoRow;
}
type FileUploadFile = File & { objectURL: string };
const Mb = 1024 * 1024;
export const TramitarDialog = ({
    visivel = false,
    onHide,
    recebidoSuccesso,
    enviadoSuccesso,
    tramitarError,
    documento,
}: TramitarDialogProps) => {
    const maxFileSize = 50 * Mb;
    const initialData = {
        tipo: -1,
        titulo: "",
        descricao: "",
        arquivoPdf: "",
    };

    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>();
    const [setores, setSetores] = useState<Setor[]>();
    const [tramitacaoSetores, setTramitacaoSetores] =
        useState<TramitacaoSetores>({});
    const [data, setData] = useState<CreateDocumentoDTO>(initialData);
    const [errors, setErrors] = useState<string[]>([]);
    const documentService = new DocumentService();
    const setorService = new SetorService();

    const [file, setFile] = useState<File>();
    const [editTramitacaoId, setEditTramitacaoId] = useState<number>();

    const recebido = useMemo(() => {
        if (documento) {
            const tramitacaoMaisRecente =
                documentService.getTramitacaoMaisRecente(documento!);
            setEditTramitacaoId(tramitacaoMaisRecente?.id);
            return !!(
                documento?.tramitacoes &&
                tramitacaoMaisRecente?.dataHoraRecebido
            );
        }
        return false;
    }, [documento]);

    const naoTramitado = useMemo(() => {
        return !documento?.tramitacoes || documento?.tramitacoes.length == 0;
    }, [documento]);

    const fileUploader = useRef<FileUpload>(null);

    useEffect(() => {
        documentService.carregarTiposDeDocumento().then((v) => {
            setTiposDocumento(v);
        });
        setorService.carregarSetores().then((v) => {
            setSetores(v);
        });
    }, []);

    useEffect(() => {
        if (visivel && documento) {
            setErrors([]);
            setFile(undefined);
            setData({
                tipo: documento!.tipoDocumento.id,
                titulo: documento!.titulo,
                descricao: documento!.descDocumento,
                arquivoPdf: documento!.pathArquivoPDF,
            });
            setFakeFile();
            const tramitacaoMaisRecente =
                documentService.getTramitacaoMaisRecente(documento);
            if (tramitacaoMaisRecente) {
                if (recebido) {
                    setTramitacaoSetores({
                        setorEnvio: tramitacaoMaisRecente.setorRecebe,
                        setorRecebimento: undefined,
                    });
                } else {
                    setTramitacaoSetores({
                        setorEnvio: tramitacaoMaisRecente.setorEnvia,
                        setorRecebimento: tramitacaoMaisRecente.setorRecebe,
                    });
                }
            } else {
                setTramitacaoSetores({});
            }
        }
    }, [visivel]);

    const setFakeFile = () => {
        if (fileUploader.current != null) {
            const fakefile: FileUploadFile = {
                ...new File([], documento!.prettyName, {
                    type: "application/pdf",
                }),
                objectURL: documento!.prettyName,
            };
            fileUploader.current.setUploadedFiles([fakefile]);
            updateFileContent();
        } else {
            setTimeout(setFakeFile, 200);
        }
    };

    const updateFileContent = () => {
        const element = (
            fileUploader.current as any
        ).getContent() as HTMLDivElement;
        const filenameEl = element.querySelector(".p-fileupload-filename");
        const filesizeEl = element.querySelector("[data-pc-section=filesize]");
        if (filenameEl && filesizeEl) {
            filenameEl.innerHTML = documento!.prettyName;
            (filesizeEl as HTMLElement).style.display = "none";
        } else {
            setTimeout(updateFileContent, 150);
        }
    };

    const uploadHandler = (event: any) => {
        fileUploader.current?.setUploadedFiles([]);
        const file = event.files[0];
        setFile(file);
    };

    const validateForm = useCallback(() => {
        let errors: string[] = [];
        if (
            tramitacaoSetores.setorEnvio == tramitacaoSetores.setorRecebimento
        ) {
            errors.push(
                "O setor que enviou o documento não pode ser o mesmo que o recebe"
            );
        }
        if (tramitacaoSetores.setorEnvio == undefined) {
            errors.push("Selecione um setor de envio");
        }
        if (tramitacaoSetores.setorRecebimento == undefined) {
            errors.push("Selecione um setor de recebimento");
        }
        setErrors(errors);
        return errors.length == 0;
    }, [tramitacaoSetores]);

    const handleSave = useCallback(async () => {
        if (validateForm()) {
            try {
                if (recebido || naoTramitado) {
                    await documentService.enviarDocumento(
                        documento!.id,
                        tramitacaoSetores
                    );
                    enviadoSuccesso();
                } else {
                    await documentService.receberDocumento(editTramitacaoId!);
                    recebidoSuccesso();
                }
                onHide();
            } catch (err) {
                tramitarError();
            }
        }
    }, [tramitacaoSetores]);

    return (
        <Dialog
            visible={visivel}
            onHide={onHide}
            header={`${
                recebido || naoTramitado ? "Enviar" : "Receber"
            } Documento`}
            className="tramitacao-dialog formulario"
        >
            <div className="grid mb-2">
                <div className="col-6">
                    <Dropdown
                        disabled={!naoTramitado}
                        options={setores}
                        optionLabel="descSetor"
                        placeholder="Setor de envio"
                        value={tramitacaoSetores.setorEnvio}
                        onChange={(e) =>
                            setTramitacaoSetores((data) => ({
                                ...data,
                                setorEnvio: e.target.value,
                            }))
                        }
                    />
                </div>
                <div className="col-6">
                    <Dropdown
                        disabled={!recebido && !naoTramitado}
                        options={setores}
                        optionLabel="descSetor"
                        placeholder="Setor de recebimento"
                        value={tramitacaoSetores.setorRecebimento}
                        onChange={(e) =>
                            setTramitacaoSetores((data) => ({
                                ...data,
                                setorRecebimento: e.target.value,
                            }))
                        }
                    />
                </div>
            </div>
            <div className="grid mb-2">
                <div className="col-6">
                    <InputText
                        placeholder="N° Documento"
                        disabled
                        value={documento?.nroDocumento}
                    />
                </div>
                <div className="col-6">
                    <Dropdown
                        disabled
                        options={tiposDocumento}
                        optionLabel="descTipoDocumento"
                        optionValue="id"
                        placeholder="Tipo de Documento"
                        value={data?.tipo}
                        onChange={(e) =>
                            setData((data) => ({
                                ...data,
                                tipo: e.target.value,
                            }))
                        }
                    />
                </div>
            </div>
            <div className="mb-2">
                <InputText
                    disabled
                    placeholder="Título"
                    value={data?.titulo}
                    onChange={(e) =>
                        setData((data) => ({ ...data, titulo: e.target.value }))
                    }
                />
            </div>
            <div>
                <InputTextarea
                    disabled
                    placeholder="Descrição"
                    value={data?.descricao}
                    onChange={(e) =>
                        setData((data) => ({
                            ...data,
                            descricao: e.target.value,
                        }))
                    }
                />
            </div>
            <div className="upload-field mb-2 mt-1">
                <FileUpload
                    disabled
                    ref={fileUploader}
                    accept="application/pdf"
                    maxFileSize={maxFileSize}
                    customUpload
                    onSelect={uploadHandler}
                    cancelLabel="Cancel"
                    chooseOptions={{
                        icon: "pi pi-paperclip",
                        label: "Anexo",
                        style: {
                            padding: 5,
                        },
                    }}
                />
            </div>
            <div className="grid mb-2">
                <div className="col-6">
                    <InputText
                        disabled
                        placeholder="Data e hora do envio"
                        value=""
                    />
                </div>
                <div className="col-6">
                    <InputText
                        disabled
                        placeholder="Enviado por"
                        value="João"
                    />
                </div>
            </div>
            {errors ? (
                <div className="py-2" key="errors">
                    {errors.map((e, index) => (
                        <div key={index}>
                            <Message
                                severity="error"
                                className="mb-1"
                                text={e}
                            />
                            <br />
                        </div>
                    ))}
                </div>
            ) : null}
            <div className="action-buttons flex justify-content-end">
                <Button
                    outlined
                    onClick={onHide}
                    label="Cancelar"
                    className="mr-2"
                />
                <Button
                    onClick={handleSave}
                    label={recebido || naoTramitado ? "Enviar" : "Receber"}
                />
            </div>
        </Dialog>
    );
};
