'use client';

import { useState, useEffect } from 'react';
import { BlockEditorProvider, BlockList, BlockTools, WritingFlow } from '@wordpress/block-editor';
import { SlotFillProvider, Popover } from '@wordpress/components';
import { registerCoreBlocks } from '@wordpress/block-library';
import { parse, serialize } from '@wordpress/blocks';
import '@wordpress/components/build-style/style.css';
import '@wordpress/block-editor/build-style/style.css';
import '@wordpress/block-library/build-style/style.css';

// A simplified Editor component
const Editor = ({ content, onContentChange }) => {
    const [blocks, setBlocks] = useState(parse(content));

    useEffect(() => {
        registerCoreBlocks();
    }, []);

    const handleBlockChange = (newBlocks) => {
        setBlocks(newBlocks);
        onContentChange(serialize(newBlocks));
    };

    return (
        <SlotFillProvider>
            <BlockEditorProvider
                value={blocks}
                onInput={handleBlockChange}
                onChange={handleBlockChange}
            >
                <BlockTools>
                    <WritingFlow>
                        <BlockList />
                    </WritingFlow>
                </BlockTools>
                <Popover.Slot />
            </BlockEditorProvider>
        </SlotFillProvider>
    );
};


export default function EditPostPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [post, setPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wp/v2/posts/${id}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch post');
                }
                const postData = await res.json();
                setPost(postData);
                setContent(postData.content.raw);
                setTitle(postData.title.rendered);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    const handleContentChange = (newContent) => {
        setContent(newContent);
    };

    const handleUpdate = async () => {
        try {
            const res = await fetch(`/api/posts/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, content }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update post');
            }

            alert('Post updated successfully!');
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Edit Post</h1>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
            />
            <Editor content={content} onContentChange={handleContentChange} />
            <button onClick={handleUpdate} style={{ marginTop: '20px', padding: '10px 20px' }}>
                Update
            </button>
        </div>
    );
}
