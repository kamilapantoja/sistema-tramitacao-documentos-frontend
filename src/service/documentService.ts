import { Documento } from "../model/documento";
import { TipoDocumento } from "../model/tipoDocumento";
import { Tramitacao } from "../model/tramitacao";
import { TramitacaoSetores } from "../model/tramitacaoSetores";
import httpClient from "../shared/cliente";

class DocumentService {
    async getDocuments() {
        const response = await httpClient.get<Documento[]>("/documento");
        if (response.status == 200) {
            return response.data;
        }
        throw Error();
    }

    async createDocument(documentData: {
        tipo: number;
        titulo: string;
        descricao: string;
        arquivoPdf: string;
    }) {
        const response = await httpClient.post("/documento", documentData);
        if (response.status === 201) {
            return response.data;
        }
        throw new Error("Erro ao criar documento");
    }

    async updateDocumento(
        id: number,
        documentData: {
            tipo: number;
            titulo: string;
            descricao: string;
            arquivoPdf: string;
        }
    ) {
        const response = await httpClient.put(`/documento/${id}`, documentData);
        if (response.status === 200) {
            return response.data;
        }
        throw new Error("Erro ao criar documento");
    }

    async carregarTiposDeDocumento() {
        const response = await httpClient.get<TipoDocumento[]>(
            "/documento/lista-tipo"
        );
        if (response.status === 200) {
            return response.data;
        }
        throw new Error("Erro ao criar documento");
    }

    async uploadFile(file: File) {
        const form = new FormData();
        form.append("file", file);
        const response = await httpClient.put<{ filename: string }>(
            "/documento/file",
            form
        );
        if ([200, 201].includes(response.status)) {
            return response.data.filename;
        }
        throw new Error("Erro ao criar documento");
    }
    async downloadFile(path: string, prettyName: string) {
        const response = await httpClient.get(`/documento/file/${path}`, {
            responseType: "blob",
        });
        if ([200, 201].includes(response.status)) {
            const href = URL.createObjectURL(response.data);
            const link = document.createElement("a");
            link.href = href;
            link.setAttribute("download", prettyName);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(href);
        }
    }

    async deleteDoc(id: number) {
        const response = await httpClient.delete(`/documento/${id}`);
        if (response.status != 200) {
            throw new Error("Erro ao criar documento");
        }
    }

    getTramitacaoMaisRecente(documento: Documento) {
        let mostRecentTramitation: Tramitacao | undefined;
        let biggerDate: number | undefined;
        for (const tramitacao of documento.tramitacoes ?? []) {
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
        return mostRecentTramitation;
    }

    async enviarDocumento(id: number, tramitacaoSetores: TramitacaoSetores) {
        const response = await httpClient.post("/documento/enviar", {
            id, // do documento
            idSetorEnvio: tramitacaoSetores.setorEnvio!.id,
            idSetorRecebimento: tramitacaoSetores.setorRecebimento!.id,
        });
        if (response.status === 201) {
            return response.data;
        }
        throw new Error("Erro ao enviar o documento");
    }

    async receberDocumento(id: number) {
        const response = await httpClient.patch("/documento/receber", {
            id, // da tramitacao
        });
        if (response.status === 200) {
            return response.data;
        }
        throw new Error("Erro ao enviar o documento");
    }
}

export default DocumentService;
