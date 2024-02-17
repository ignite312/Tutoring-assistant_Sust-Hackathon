"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { CiCirclePlus } from "react-icons/ci";
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathPreview = ({ content }) => {
    const [html, setHtml] = useState("");

    useEffect(() => {
        let htmlString = '';
        try {
            const parts = content.split(/\$(.*?)\$/).map((part, index) => {
                if (index % 2 === 0) {
                    return part; // Regular text
                } else {
                    try {
                        return katex.renderToString(part, {
                            throwOnError: false,
                        });
                    } catch (error) {
                        console.error("KaTeX rendering error:", error);
                        return `<span class="text-red-500">Error rendering equation: ${part}</span>`;
                    }
                }
            });

            htmlString = parts.join('');
        } catch (error) {
            console.error("Error processing equations:", error);
            htmlString = `<span class="text-red-500">Error processing equations</span>`;
        }
        setHtml(htmlString);
    }, [content]);

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};


export default function Classwork() {
    const [posts, setposts] = useState([]);

    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [myStr, setmyStr] = useState("");
    const [assessment, setassessment] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await fetch("http://10.100.161.41:8000/get-posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: "emon"
                    })
                });
                const responseData = await resp.json();
                setPosts(responseData);
            } catch (err) {
                console.error('Error getting posts: ', err);
            }
        };
        fetchData();
    }, []);
    const parseProblems = (problems) => {
        try {
            return JSON.parse(problems);
        } catch {
            // If JSON.parse fails, assume it's a single string
            return [problems]; // Wrap in array for consistent handling
        }
    };
    const handleFileChange = (event, problemset) => {
        setFile(event.target.files[0]); // Set the selected file
        setmyStr(problemset);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                // Log the text content of the file
                // console.log("Problems : ", problemset);
                console.log(myStr); // this is the question to be send for checking script
                console.log("File content:", text); // this is the answer we need to check based on the question
                const fetchData = async () => {
                    try {
                        const resp = await fetch("http://10.100.161.41:8000/assessment", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                problemset: myStr,
                                answerscript: text
                            })
                        });
                        const responseData = await resp.json();
                        console.log(responseData);
                        setassessment(responseData);
                        console.log(responseData);
                    } catch (err) {
                        console.error('Error getting posts: ', err);
                    }
                }
                fetchData();

            };
            reader.readAsText(file); // Read the file as text
        }
        // Log the description for completeness
        // console.log("Description:", description);
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const resp = await fetch("http://10.100.161.41:8000/get-posts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: "emon"
                    })
                });
                const responseData = await resp.json();
                console.log(responseData);
                setposts(responseData);
                console.log(responseData);
            } catch (err) {
                console.error('Error getting posts: ', err);
            }
        }
        fetchData();
    }, []);
    const renderMathEquation = (equation) => {
        try {
            // Render equation using KaTeX
            return katex.renderToString(equation, { throwOnError: false });
        } catch (error) {
            console.error("KaTeX rendering error:", error);
            // Display error message if KaTeX fails
            return `<span class="text-red-500">Error rendering equation: ${equation}</span>`;
        }
    };

    return (
        <div className="bg-white text-black flex flex-col h-screen">
            <div className="flex justify-end p-4">
                <div>
                    <Link href="/classwork/createnew">

                        <div className="btn btn-outline text-black">
                            <CiCirclePlus style={{ fontSize: '2em' }} />
                            Create New Question
                        </div>
                    </Link>
                </div>
            </div>

            <div className="flex justify-center flex-1">
                <div className="w-1/2">
                    <ul className="questions-list space-y-4">

                    {posts.map((post) => (
                            <li key={post.id} className="bg-gray-100 p-4 rounded-md shadow-md">
                                <h1 className="text-lg font-bold text-gray-800 mb-2">Author: {post.creator}</h1>
                                {parseProblems(post.problems).map((problem, index) => (
                                    <MathPreview key={index} content={problem} />
                                ))}
                                <h1 className="text-sm text-gray-600 mt-2">Date Created: {new Date(post.posttime).toLocaleString()}</h1>
                                <form onSubmit={handleSubmit}>
                                        <div className="mb-4">
                                            <label htmlFor="file" className="block text-sm font-bold m-2">Upload File (TXT):</label>
                                            <input type="file" id="file" accept=".txt" onChange={(event) => handleFileChange(event, post.problems)} className="w-full border border-gray-300 rounded px-3 py-2 bg-white" />
                                        </div>
                                        <button type="submit" className="btn btn-neutral text-white font-bold py-2 px-4 rounded">Check Script</button>
                                    </form>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>



        </div>
    );
}