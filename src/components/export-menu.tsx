import { useState } from "react";
import {
	Button,
	Dropdown,
	DropdownItem,
	DropdownMenu,
	DropdownTrigger,
} from "@nextui-org/react";
import {
	IconDownload,
	IconFileCode,
	IconFileSpreadsheet,
	IconTable,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { TVehicleWithServices } from "../types/vehicle.type";
import {
	exportFilename,
	vehiclesToCsv,
	vehiclesToJson,
} from "../utils/exportVehicles";
import { downloadXlsx } from "../utils/exportExcel";
import { downloadTextFile } from "../utils/downloadFile";

interface ExportMenuProps {
	vehicles: TVehicleWithServices[];
	/** Names the file when exporting a single vehicle. */
	slug?: string;
	variant?: "bordered" | "light";
}

export const ExportMenu = ({
	vehicles,
	slug,
	variant = "bordered",
}: ExportMenuProps) => {
	// The Excel writer is fetched on demand, so the button can sit briefly
	// pending on a slow connection.
	const [isExporting, setIsExporting] = useState(false);

	const handleAction = async (key: React.Key) => {
		if (key === "csv") {
			downloadTextFile(
				exportFilename("csv", { slug }),
				vehiclesToCsv(vehicles),
				"text/csv"
			);
			return;
		}

		if (key === "json") {
			downloadTextFile(
				exportFilename("json", { slug }),
				vehiclesToJson(vehicles),
				"application/json"
			);
			return;
		}

		setIsExporting(true);
		try {
			await downloadXlsx(vehicles, { slug });
		} catch {
			toast.error("Could not build the Excel file");
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<Dropdown>
			<DropdownTrigger>
				<Button
					variant={variant}
					color={variant === "light" ? "primary" : "default"}
					isLoading={isExporting}
					startContent={
						isExporting ? undefined : <IconDownload size={18} />
					}
				>
					Export
				</Button>
			</DropdownTrigger>
			<DropdownMenu aria-label="Export service data" onAction={handleAction}>
				<DropdownItem
					key="xlsx"
					description="Typed dates and numbers"
					startContent={<IconFileSpreadsheet size={18} />}
				>
					Excel (XLSX)
				</DropdownItem>
				<DropdownItem
					key="csv"
					description="One row per service"
					startContent={<IconTable size={18} />}
				>
					Spreadsheet (CSV)
				</DropdownItem>
				<DropdownItem
					key="json"
					description="Full backup"
					startContent={<IconFileCode size={18} />}
				>
					Backup (JSON)
				</DropdownItem>
			</DropdownMenu>
		</Dropdown>
	);
};
