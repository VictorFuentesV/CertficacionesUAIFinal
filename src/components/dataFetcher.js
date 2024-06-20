import React, { useEffect, useState } from 'react';
import {supabase} from '../supabaseClient';

const DataFetcher = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from('userinfo') // Update with your table name
                .select('*');

            if (error) {
                console.error(error);
            } else {
                setData(data);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (data.length === 0) {
        return <p>No data available</p>;
    }

    return (
        <div>
            <h1>Data from Supabase</h1>
            <table>
                <thead>
                    <tr>
                        {Object.keys(data[0]).map((key) => (
                            <th key={key}>{key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id}>
                            {Object.keys(row).map((key) => (
                                <td key={key}>{row[key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataFetcher;