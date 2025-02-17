import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { useEffect, useRef, useState } from "react";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import SetorService from "../service/setorService";
import { Setor } from "../model/setor";
import { SetorDialog } from "../components/SetorDialog";

export const GerenciadorDeSetor = () => {
    const [setores, setSetores] = useState<Setor[]>();
    const [loading, setLoading] = useState(false);
    const [setorDialogVisivel, setSetorDialogVisivel] = useState(false);
    const [setorSelecionado, setSetorSelecionado] = useState<Setor>();
    const toast = useRef<Toast>(null);

    const setorService = new SetorService();

    useEffect(() => {
        loadSetores(); // <- async
    }, []);

    const loadSetores = async () => {
        setLoading(true);
        const response = await setorService.carregarSetores();
        setSetores(response);
        setLoading(false);
    };

    const handleCreateButton = () => {
        setSetorSelecionado(undefined);
        setSetorDialogVisivel(true);
    };

    const createSuccess = () => {
        toast.current?.show({
            severity: "success",
            summary: "Setor criado",
            detail: "Setor criado com sucesso",
            life: 3000,
        });
        loadSetores(); // <- async
    };

    const updateSuccess = () => {
        toast.current?.show({
            severity: "success",
            summary: "Setor Atualizado",
            detail: "Setor atualizado com sucesso",
            life: 3000,
        });
        loadSetores(); // <- async
    };

    const createError = () => {
        toast.current?.show({
            severity: "error",
            summary: "Falha ao criar o documento",
            life: 3000,
        });
    };

    const onEdit = (setor: Setor) => {
        setSetorSelecionado(setor);
        setSetorDialogVisivel(true);
    };

    const onDelete = async (setor: Setor) => {
        await setorService.deleteSetor(setor.id!);
        toast.current?.show({
            severity: "success",
            summary: "Setor Deletado",
            detail: "Setor deletado com sucesso",
            life: 3000,
        });
        loadSetores();
    };

    const setorActions = (setor: Setor) => {
        return (
            <div className="flex">
                <Button
                    icon="pi pi-pencil"
                    text
                    onClick={() => onEdit(setor)}
                />
                <Button
                    icon="pi pi-trash"
                    text
                    onClick={() => onDelete(setor)}
                />
            </div>
        );
    };

    return (
        <Card title="Gerenciamento de Setores" className="gerencia-setores">
            <Toast ref={toast} />
            <SetorDialog
                visible={setorDialogVisivel}
                onHide={() => setSetorDialogVisivel(false)}
                createSuccess={createSuccess}
                createError={createError}
                updateSuccess={updateSuccess}
                setor={setorSelecionado}
            />
            <p>Setores</p>
            <Button onClick={handleCreateButton} className="mb-2">
                Cadastrar
            </Button>
            <DataTable
                loading={loading}
                value={setores}
                filterDisplay="row"
                filterIcon={[]}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25, 50]}
            >
                <Column field="sigla" header="Sigla" />
                <Column field="descSetor" header="Descrição" />
                <Column
                    header="Ações"
                    style={{ width: "100px" }}
                    body={setorActions}
                />
            </DataTable>
        </Card>
    );
};
