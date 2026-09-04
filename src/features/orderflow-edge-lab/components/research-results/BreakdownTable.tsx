import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BreakdownRow } from "../../types";
import { formatPercent, formatR } from "../../lib/formatters";

interface BreakdownTableProps {
  title: string;
  rows: BreakdownRow[];
}

const BreakdownTable = ({ title, rows }: BreakdownTableProps) => {
  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-wide text-text-muted mb-2">{title}</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[10px]">Bucket</TableHead>
            <TableHead className="text-[10px]">N</TableHead>
            <TableHead className="text-[10px]">Win Rate</TableHead>
            <TableHead className="text-[10px]">Avg R</TableHead>
            <TableHead className="text-[10px]">Expectancy</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label}>
              <TableCell className="text-xs">{row.label}</TableCell>
              <TableCell className="text-xs">{row.n}</TableCell>
              <TableCell className="text-xs">{formatPercent(row.winRate)}</TableCell>
              <TableCell className="text-xs">{formatR(row.avgR)}</TableCell>
              <TableCell className="text-xs">{formatR(row.expectancy)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-text-muted text-xs text-center py-4">
                No trades in this breakdown.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BreakdownTable;
