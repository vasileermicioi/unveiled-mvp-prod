// @atoms-re-export
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";

import { AtomStoryBackdrop } from "../backdrop";

const TABLE_CHROME = `
.unveiled-table-wrap { display: block; width: 100%; }
.unveiled-table-wrap > div { display: block; }
.unveiled-table { display: table; width: 100%; border-collapse: collapse; background: transparent; border: 4px solid #202621; table-layout: fixed; border-radius: 0; box-sizing: border-box; }
.unveiled-table thead { display: table-header-group; background: transparent; }
.unveiled-table tbody { display: table-row-group; background: transparent; }
.unveiled-table tr { display: table-row; background: transparent; }
.unveiled-table th, .unveiled-table td { display: table-cell; box-sizing: border-box; }
.unveiled-table th { background: #202621; color: #fff; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.18em; padding: 0.75rem 1rem; text-align: left; vertical-align: middle; border: 0; border-radius: 0; }
.unveiled-table th:first-child { width: 50%; }
.unveiled-table th:nth-child(2) { width: 25%; }
.unveiled-table th:nth-child(3) { width: 25%; }
.unveiled-table td { background: #fff; color: #202621; font-size: 0.875rem; font-weight: 400; padding: 0.75rem 1rem; text-align: left; vertical-align: middle; border: 0; border-bottom: 2px solid rgba(32, 38, 33, 0.2); border-radius: 0; }
.unveiled-table td:first-child { width: 50%; }
.unveiled-table td:nth-child(2) { width: 25%; }
.unveiled-table td:nth-child(3) { width: 25%; }
`;

export const Default = () => (
  <AtomStoryBackdrop className="flex-col items-stretch">
    <style dangerouslySetInnerHTML={{ __html: TABLE_CHROME }} />
    <Table
      aria-label="Example table"
      removeWrapper
      classNames={{
        base: "unveiled-table-wrap",
        table: "unveiled-table",
        th: "",
        td: "",
      }}
    >
      <TableHeader>
        <TableColumn align="start">NAME</TableColumn>
        <TableColumn align="start">ROLE</TableColumn>
        <TableColumn align="start">STATUS</TableColumn>
      </TableHeader>
      <TableBody>
        <TableRow key="1">
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Engineer</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow key="2">
          <TableCell>Grace Hopper</TableCell>
          <TableCell>Architect</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow key="3">
          <TableCell>Margaret Hamilton</TableCell>
          <TableCell>Director</TableCell>
          <TableCell>Inactive</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </AtomStoryBackdrop>
);

export default {
  title: "Atoms / Table",
  parameters: { ladle: { skipCoverage: true } },
};
