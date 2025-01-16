import { useState } from "react";
import { Button, Divider } from "@mui/material";

const PolicyInputGrid = ({ submitting, onSubmit }) => {
    const columns = ["Individual", "Floater", "2 Years", "3 Years"];
    const rows = ["5L", "10L", "15L"];

    const [formData, setFormData] = useState(
        columns.reduce((acc, col) => {
            acc[col] = rows.reduce((rowAcc, row) => {
                rowAcc[row] = "";
                return rowAcc;
            }, {});
            return acc;
        }, {})
    );

    const handleChange = (event) => {
        const { name, value, dataset } = event.target;
        const column = dataset.column;

        setFormData((prevFormData) => ({
            ...prevFormData,
            [column]: {
                ...prevFormData[column],
                [name]: value,
            },
        }));
    };

    const transformData = (data) => {
        const rows = Object.keys(data[Object.keys(data)[0]]);
        const columns = Object.keys(data);

        const result = [
            ["Policy", ...columns],
            ...rows.map((row) => [row, ...columns.map((col) => data[col][row])])
        ];

        return result;
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit(transformData(formData));
    };

    return (
        <div className="policy-input-grid bg-white rounded-xl shadow-[rgba(50,_50,_105,_0.15)_0px_2px_5px_0px,_rgba(0,_0,_0,_0.05)_0px_1px_1px_0px]">
            <h2 className="text-3xl font-semibold p-4">Policy Input Grid</h2>
            <Divider />
            <form className="m-4 pb-4" onSubmit={handleSubmit}>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2">Policy</th>
                                {columns.map((col) => (
                                    <th key={col} className="border border-gray-300 px-4 py-2">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row}>
                                    <td className="border border-gray-300 px-4 py-2">{row}</td>
                                    {columns.map((col) => (
                                        <td key={`${col}-${row}`} className="border border-gray-300 px-4 py-2">
                                            <input
                                                type="text"
                                                name={row}
                                                value={formData[col][row]}
                                                data-column={col}
                                                onChange={handleChange}
                                                required
                                                className="border border-gray-300 p-1 w-full"
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={submitting}
                        className="!mt-4 !bg-gray-900 text-white px-4 py-2 rounded hover:opacity-95"
                    >
                        Submit
                    </Button>
                </div>
                <p className="text-gray-700">*Enter NA if no quotation</p>
            </form>
        </div>
    );
};

export default PolicyInputGrid;
