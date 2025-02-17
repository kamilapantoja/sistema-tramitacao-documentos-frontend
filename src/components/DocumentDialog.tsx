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

interface DocumentDialogProps {
    visible: boolean;
    onHide: () => void;
    createSuccess: () => void;
    createError: () => void;
    updateSuccess: () => void;
    document?: DocumentoRow;
}
type FileUploadFile = File & { objectURL: string };
const Mb = 1024 * 1024;
export const DocumentDialog = ({
    visible = false,
    onHide,
    createSuccess,
    updateSuccess,
    createError,
    document,
}: DocumentDialogProps) => {
    const maxFileSize = 50 * Mb;
    const initialData = {
        tipo: -1,
        titulo: "",
        descricao: "",
        arquivoPdf: "",
    };

    const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>();
    const [data, setData] = useState<CreateDocumentoDTO>(initialData);
    const [errors, setErrors] = useState<string[]>([]);
    const documentService = new DocumentService();

    const [file, setFile] = useState<File>();

    const isEdit = useMemo(() => {
        return !!document;
    }, [document]);
    const fileUploader = useRef<FileUpload>(null);

    useEffect(() => {
        documentService.carregarTiposDeDocumento().then((v) => {
            setTiposDocumento(v);
        });
    }, []);

    useEffect(() => {
        if (visible) {
            if (isEdit) {
                setErrors([]);
                setFile(undefined);
                setData({
                    tipo: document!.tipoDocumento.id,
                    titulo: document!.titulo,
                    descricao: document!.descDocumento,
                    arquivoPdf: document!.pathArquivoPDF,
                });
                setFakeFile();
            } else {
                setData(initialData);
                setFile(undefined);
            }
        }
    }, [visible]);

    const setFakeFile = () => {
        if (fileUploader.current != null) {
            const fakefile: FileUploadFile = {
                ...new File([], document!.prettyName, {
                    type: "application/pdf",
                }),
                objectURL: document!.prettyName,
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
            filenameEl.innerHTML = document!.prettyName;
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
        let errors = [];
        if (!data.titulo.trim()) {
            errors.push("Título não pode ser vazio");
        }
        if (data.tipo < 1) {
            errors.push("Escolha o tipo do documento");
        }
        if (!data.titulo.trim()) {
            errors.push("Descrição não pode ser vazio");
        }
        if (!isEdit && (!file || file!.size <= 0)) {
            errors.push("Documento precisa de um anexo");
        }
        setErrors(errors);
        return errors.length == 0;
    }, [data, file]);

    const handleSave = useCallback(async () => {
        if (validateForm()) {
            try {
                let filename = isEdit ? document?.pathArquivoPDF ?? "" : "";
                if (file != null) {
                    filename = await documentService.uploadFile(file!);
                }
                if (isEdit) {
                    await documentService.updateDocumento(document!.id, {
                        ...data,
                        arquivoPdf: filename,
                    });
                    updateSuccess();
                } else {
                    await documentService.createDocument({
                        ...data,
                        arquivoPdf: filename,
                    });
                    createSuccess();
                }
                onHide();
            } catch (err) {
                createError();
            }
        }
    }, [data, file]);

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={`${isEdit ? "Editar" : "Novo"} Documento`}
            className="document-dialog formulario"
        >
            <div className="grid mb-2">
                <div className="col-6">
                    <InputText
                        placeholder="N° Documento"
                        disabled
                        value={document?.nroDocumento}
                    />
                </div>
                <div className="col-6">
                    <Dropdown
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
                    placeholder="Título"
                    value={data?.titulo}
                    onChange={(e) =>
                        setData((data) => ({ ...data, titulo: e.target.value }))
                    }
                />
            </div>
            <div>
                <InputTextarea
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
            {errors ? (
                <div className="py-2">
                    {errors.map((e, index) => (
                        <>
                            <Message
                                severity="error"
                                className="mb-1"
                                text={e}
                                key={index}
                            />
                            <br />
                        </>
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
                    label={`Salvar${isEdit ? " alterações" : ""}`}
                />
            </div>
        </Dialog>
    );
};
