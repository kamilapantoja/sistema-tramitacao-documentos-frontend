import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Message } from "primereact/message";
import { Setor } from "../model/setor";
import SetorService from "../service/setorService";

interface SetorDialogProps {
    visible: boolean;
    onHide: () => void;
    createSuccess: () => void;
    createError: () => void;
    updateSuccess: () => void;
    setor?: Setor;
}
export const SetorDialog = ({
    visible = false,
    onHide,
    createSuccess,
    updateSuccess,
    createError,
    setor,
}: SetorDialogProps) => {
    const initialData = {
        sigla: "",
        descSetor: "",
    };

    const [data, setData] = useState<Setor>(initialData);
    const [errors, setErrors] = useState<string[]>([]);
    const setorService = new SetorService();

    const isEdit = useMemo(() => {
        return !!setor;
    }, [setor]);

    useEffect(() => {
        if (visible) {
            if (isEdit) {
                setErrors([]);
                setData({
                    ...(setor ?? initialData),
                });
            } else {
                setData(initialData);
            }
        }
    }, [visible]);

    const validateForm = useCallback(() => {
        let errors = [];
        if (!data.descSetor?.trim()) {
            errors.push("Descrição do setor nao pode ser vazio");
        }
        if (!data.sigla?.trim()) {
            errors.push("Sigla do setor não pode ser vazio");
        }
        setErrors(errors);
        return errors.length == 0;
    }, [data]);

    const handleSave = useCallback(async () => {
        if (validateForm()) {
            try {
                if (isEdit) {
                    await setorService.updateSetor(setor!.id!, data);
                    updateSuccess();
                } else {
                    await setorService.createSetor(data);
                    createSuccess();
                }
                onHide();
            } catch (err) {
                createError();
            }
        }
    }, [data]);

    return (
        <Dialog
            visible={visible}
            onHide={onHide}
            header={`${isEdit ? "Editar" : "Novo"} Setor`}
            className="document-dialog formulario"
        >
            <div className="grid mb-2">
                <div className="col-6">
                    <InputText
                        placeholder="Sigla"
                        value={data.sigla}
                        onChange={(e) =>
                            setData({ ...data, sigla: e.target.value })
                        }
                    />
                </div>
                <div className="col-6">
                    <InputText
                        placeholder="Descrição"
                        value={data.descSetor}
                        onChange={(e) =>
                            setData({ ...data, descSetor: e.target.value })
                        }
                    />
                </div>
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
