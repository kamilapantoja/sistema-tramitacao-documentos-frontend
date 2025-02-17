import { Setor } from "../model/setor";
import httpClient from "../shared/cliente";

class SetorService {
    async carregarSetores() {
        const response = await httpClient.get<Setor[]>("/setor");
        if (response.status === 200) {
            return response.data;
        }
        throw new Error("Erro ao criar setor");
    }
    async createSetor(data: Setor) {
        const response = await httpClient.post(`/setor`, data);
        if (response.status != 201) {
            throw new Error("Erro ao atualizar setor");
        }
    }
    async updateSetor(id: number, data: Setor) {
        delete data["id"];
        const response = await httpClient.put(`/setor/${id}`, data);
        if (response.status != 200) {
            throw new Error("Erro ao atualizar setor");
        }
    }
    async deleteSetor(id: number) {
        const response = await httpClient.delete(`/setor/${id}`);
        if (response.status != 200) {
            throw new Error("Erro ao deletar setor");
        }
    }
}

export default SetorService;
