import { Column } from "react-table";
import TableHOC from "./TableHOC";
interface DataType {
  orderId: string;
  quantity: number;
  discount: number;
  amount: number;
  status: string;
}

const columns: Column<DataType>[] = [
  {
    Header: "Id",
    accessor: "orderId", // ✅ updated accessor
  },
  {
    Header: "Quantity",
    accessor: "quantity",
  },
  {
    Header: "Discount",
    accessor: "discount",
  },
  {
    Header: "Amount",
    accessor: "amount",
  },
  {
    Header: "Status",
    accessor: "status",
  },
];

const DashboardTable = ({ data = [] }: { data: DataType[] }) => {
  const Table = TableHOC<DataType>(
    columns,
    data,
    "transaction-box",
    "Top Transaction"
  );

  return <Table />;
};

export default DashboardTable;
