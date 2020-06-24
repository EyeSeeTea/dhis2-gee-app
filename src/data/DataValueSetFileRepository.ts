import DataValueSetRepository, {
    SaveDataValueSetReponse,
} from "../domain/repositories/DataValueSetRepository";
import { DataValueSet } from "../domain/entities/DataValueSet";
import i18n from "@dhis2/d2-i18n";

type Options = { filename: string; mimeType: string; contents: string | ArrayBuffer };

class DataValueSetFileRepository implements DataValueSetRepository {
    async save(dataValueSet: DataValueSet): Promise<SaveDataValueSetReponse> {
        this.downloadFile({
            filename: "data.json",
            mimeType: "application/json",
            contents: JSON.stringify(dataValueSet),
        });
        return i18n.t("No effective import into DHIS2, file download");
    }

    private downloadFile(options: Options) {
        const { filename, mimeType, contents } = options;
        const blob = new Blob([contents], { type: mimeType });
        const element = document.createElement("a");
        element.id = "download-file";
        element.href = window.URL.createObjectURL(blob);
        element.setAttribute("download", filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
    }
}

export default DataValueSetFileRepository;
