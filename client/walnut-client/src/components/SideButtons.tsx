// src/components/SideButtons.tsx
import { useState, useEffect, useRef, useContext } from "react";
import { ChatMetaContext } from "../context/ChatMetaContext";
import { PromptContext, PromptCountContext, MessageContext } from "../context/context";
import constants from "../constants/constants";

type ChatItem = {
    _id: string;
    title: string;
    createdAt: string;
    messages?: { role: string; content: string }[];
    messageCount?: number;
};

const batchSize = 20;

function ChatMenu() {
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const scrollRef = useRef<HTMLDivElement | null>(null);
    const isFetchingRef = useRef(false);
    const tickingRef = useRef(false);

    const { setChatTitle, setChatCreationDateTime } = useContext(ChatMetaContext);
    const { setPrompt } = useContext(PromptContext)!;
    const { setPromptCount } = useContext(PromptCountContext)!;
    const { messages, setMessages } = useContext(MessageContext)!;

    const toISTDate = (timestamp: string | Date) => {
        const d = new Date(timestamp);
        return new Date(d.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    };

    const ddmm = (dateLike: string | Date) => {
        const d = toISTDate(dateLike);
        const day = d.getDate().toString().padStart(2, "0");
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        return `${day}-${month}`;
    };

    const labelDate = (dateLike: string | Date) => {
        const d = toISTDate(dateLike);
        const today = toISTDate(new Date());
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const sameDay = (a: Date, b: Date) =>
            a.getDate() === b.getDate() &&
            a.getMonth() === b.getMonth() &&
            a.getFullYear() === b.getFullYear();

        if (sameDay(d, today)) return "Today";
        if (sameDay(d, yesterday)) return "Yesterday";
        return ddmm(d);
    };

    const fetchChatBatch = async () => {
        if (isFetchingRef.current) return;
        if (cursor !== null && !hasMore) return;

        try {
            isFetchingRef.current = true;

            // NOTE: correct endpoint is /ai/chats as served by your backend router
            const res = await fetch(`${constants.origin}/ai/chats`);
            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }
            const data = await res.json();

            // backend returns { success: true, result: [ ...chats ] }
            const raw = data?.result ?? [];

            const normalized: ChatItem[] = raw.map((c: any) => ({
                _id: c.chatCreationDateTime,
                title: c.chatTitle,
                createdAt: c.chatCreationDateTime,
                messages: c.messages ?? [],
                messageCount: (c.messages ?? []).length
            }));

            // sort newest -> oldest before grouping so "Today" appears first
            const sorted = [...normalized].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            if (cursor === null) {
                setChats(sorted);
                setCursor("page2");
                setHasMore(false);
            } else {
                // If you later want paging, append sorted
                setChats(prev => [...prev, ...sorted]);
            }
        } catch (err) {
            console.error("fetchChatBatch error:", err);
        } finally {
            isFetchingRef.current = false;
        }
    };

    const grouped = (() => {
        // building groups from a sorted array preserves group insertion order (newest first)
        const groups: Record<string, typeof chats> = {};
        for (const chat of chats) {
            const key = ddmm(chat.createdAt);
            if (!groups[key]) groups[key] = [];
            groups[key].push(chat);
        }
        return groups;
    })();

    const handleChatClick = async (id: string) => {
        const selected = chats.find((c) => c._id === id);
        if (!selected) return;

        setChatTitle(selected.title);
        setChatCreationDateTime(selected.createdAt);

        sessionStorage.setItem("chatTitle", selected.title);
        sessionStorage.setItem("chatCreationDateTime", selected.createdAt);

        setMessages(selected.messages || []);
        setPrompt("");
        setPromptCount(selected.messages?.length || 0);
    };

    useEffect(() => {
        fetchChatBatch();
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        const onScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;

            requestAnimationFrame(() => {
                const scrollPos = el.scrollTop + el.clientHeight;
                const total = el.scrollHeight;
                const percent = total > 0 ? scrollPos / total : 0;

                if (percent >= 0.9 && !isFetchingRef.current && hasMore) {
                    fetchChatBatch();
                }

                tickingRef.current = false;
            });
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => el.removeEventListener("scroll", onScroll);
    }, [hasMore]);

    return (
        <div
            ref={scrollRef}
            className="h-full overflow-y-auto max-h-80"
            style={{ WebkitOverflowScrolling: "touch" }}
        >
            {Object.entries(grouped).length > 0 ? (
                Object.entries(grouped).map(([date, chatList]) => (
                    <div key={date} className="mb-4 pr-4 mt-3 mr-2">
                        <div className="font-bold mb-1 ml-4 flex items-center gap-x-1" style={{ color: 'var(--walnut-accent-darker)' }}>
                            <div className="h-4 w-[2.5px] rounded-full" style={{ backgroundColor: 'var(--walnut-accent-darker)' }}></div>
                            <p>{labelDate(chatList[0].createdAt)}</p>
                        </div>
                        {chatList.map(chat => (
                            <div
                                onClick={() => handleChatClick(chat._id)}
                                key={chat._id}
                                className="duration-200 cursor-pointer rounded-tr-full rounded-br-full p-1 pl-5 pr-2 whitespace-nowrap overflow-hidden text-ellipsis"
                                style={{
                                    color: 'var(--walnut-darker)',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--walnut-dark)';
                                    e.currentTarget.style.color = 'var(--walnut-pale)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'var(--walnut-darker)';
                                }}
                            >
                                {chat.title}
                            </div>
                        ))}
                    </div>
                ))
            ) : (
                <div className="h-full w-full px-4 flex items-center justify-center text-center opacity-80" style={{ color: 'var(--walnut-accent-darker)' }}>
                    <span>
                        Seems like we've never had any conversation,{" "}
                        <span className="font-bold">let's start one...</span>
                    </span>
                </div>
            )}
        </div>
    );
}

function SideButtons() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [chatsHover, setChatsHover] = useState(false);

    const { setChatTitle, setChatCreationDateTime } = useContext(ChatMetaContext);
    const { setPrompt } = useContext(PromptContext)!;
    const { setPromptCount } = useContext(PromptCountContext)!;
    const { setMessages } = useContext(MessageContext)!;

    const handleNewChatBtn = () => {
        setChatTitle("");
        setChatCreationDateTime("");
        setPrompt("");
        setPromptCount(0);
        setMessages([]);

        sessionStorage.removeItem("chatTitle");
        sessionStorage.removeItem("chatCreationDateTime");
    };

    const handleExpandSideBarBtn = () => {
        setIsExpanded(true);
    };

    const handleCollapseSideBarBtn = () => {
        setIsExpanded(false);
    };

    const containerClassBase = `
        cursor-pointer transition-all duration-500 ease-in-out
        hover:translate-x-0 flex items-center justify-between text-xl font-semibold rounded-tr-full rounded-br-full
        w-fit pl-2 p-1.25 mb-3
    `;

    const containerClassBaseStyle = {
        backgroundColor: 'var(--walnut-pale)'
    };

    const containerClass = `
        cursor-pointer transition-all duration-500 ease-in-out
        hover:translate-x-0 flex items-center justify-between text-xl font-semibold rounded-tr-full rounded-br-full
        w-fit p-1.25 mb-3
    `;

    const containerClassStyle = {
        backgroundColor: 'var(--walnut-dark)'
    };

    const btnClassBase = `rounded-full h-8 w-8 flex items-center justify-center duration-200 cursor-pointer`;
    const btnClass = `rounded-full h-8 w-8 ml-3 flex items-center justify-center hover:scale-110 duration-200 cursor-pointer`;
    const btnStyle = {
        backgroundColor: 'var(--walnut-pale)'
    };
    const iconClass = `auto cursor-pointer`;

    return (
        <div className="duration-200 select-none absolute top-[20%] left-0">
            <div className="flex items-start duration-500">
                <div className={`flex items-start z-100 duration-500 ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div
                        className={`
                            h-96 w-72
                            rounded-tr-3xl
                            rounded-br-3xl
                            absolute
                            z-30
                            duration-500 shadow-lg
                            ${isExpanded ? 'translate-x-0' : '-translate-x-full'}
                        `}
                        style={{ backgroundColor: '#E8B675' }}
                    >
                        <div className="flex p-2 items-start justify-between">
                            <h3 className="text-2xl flex gap-x-1 ml-1.5 font-semibold" style={{ color: 'var(--walnut-darker)' }}>
                                <span className="font-semibold">Chat</span>
                            </h3>
                            <div className="flex items-center gap-x-0.5">
                                <button
                                    className={`${btnClassBase} scale-90 hover:scale-100`}
                                    style={btnStyle}
                                    onClick={handleNewChatBtn}
                                    title="New Chat"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none" className={`${iconClass} scale-120`}>
                                        <circle cx="13.2818" cy="13.2818" r="13.2818" fill="var(--walnut-dark)" />
                                        <path
                                            d="M21.0603 12.974C21.0603 13.5517 20.5921 14.02 20.0144 14.02H16.3882C15.4769 14.02 14.7382 14.7587 14.7382 15.67V19.5596C14.7382 20.18 14.2352 20.683 13.6148 20.683C12.9943 20.683 12.4914 20.18 12.4914 19.5596V15.67C12.4914 14.7587 11.7526 14.02 10.8414 14.02H7.24614C6.66848 14.02 6.2002 13.5517 6.2002 12.974C6.2002 12.3964 6.66848 11.9281 7.24614 11.9281H10.8414C11.7526 11.9281 12.4914 11.1894 12.4914 10.2781V6.43494C12.4914 5.8145 12.9943 5.31152 13.6148 5.31152C14.2352 5.31152 14.7382 5.8145 14.7382 6.43494V10.2781C14.7382 11.1894 15.4769 11.9281 16.3882 11.9281H20.0144C20.5921 11.9281 21.0603 12.3964 21.0603 12.974Z"
                                            fill="white"
                                        />
                                    </svg>
                                </button>

                                <button
                                    className={`${btnClassBase} ${btnStyle} bg-transparent scale-90 hover:scale-100`}
                                    onClick={handleCollapseSideBarBtn}
                                    title="Collapse"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="15" viewBox="0 0 13 15" fill="none" className={`${iconClass} ml-1 scale-130`}>
                                        <path
                                            d="M7.50033 11.6668L3.33366 7.50016L7.50033 11.6668ZM3.33366 7.50016L7.50033 3.3335L3.33366 7.50016ZM3.33366 7.50016H12.167H3.33366ZM0.833659 14.1668V0.833496V14.1668Z"
                                            fill="var(--walnut-accent-darker)"
                                        />
                                        <path
                                            d="M7.50033 11.6668L3.33366 7.50016M3.33366 7.50016L7.50033 3.3335M3.33366 7.50016H12.167M0.833659 14.1668V0.833496"
                                            stroke="var(--walnut-dark)"
                                            strokeWidth="1.66667"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <ChatMenu />
                    </div>

                    <div
                        className={`${containerClassBase} z-20 ${isExpanded ? 'translate-x-0' : '-translate-x-full'}`}
                        style={{ ...containerClassBaseStyle, color: 'var(--walnut-darker)' }}
                    >
                        <button
                            className={`${btnClassBase} ml-1 hover:scale-110`}
                            style={btnStyle}
                            onClick={handleNewChatBtn}
                            onMouseEnter={() => setChatsHover(true)}
                            onMouseLeave={() => setChatsHover(false)}
                            title="New Chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none" className={`${iconClass} scale-120`}>
                                <circle cx="13.2818" cy="13.2818" r="13.2818" fill="var(--walnut-darker)" />
                                <path
                                    d="M21.0603 12.974C21.0603 13.5517 20.5921 14.02 20.0144 14.02H16.3882C15.4769 14.02 14.7382 14.7587 14.7382 15.67V19.5596C14.7382 20.18 14.2352 20.683 13.6148 20.683C12.9943 20.683 12.4914 20.18 12.4914 19.5596V15.67C12.4914 14.7587 11.7526 14.02 10.8414 14.02H7.24614C6.66848 14.02 6.2002 13.5517 6.2002 12.974C6.2002 12.3964 6.66848 11.9281 7.24614 11.9281H10.8414C11.7526 11.9281 12.4914 11.1894 12.4914 10.2781V6.43494C12.4914 5.8145 12.9943 5.31152 13.6148 5.31152C14.2352 5.31152 14.7382 5.8145 14.7382 6.43494V10.2781C14.7382 11.1894 15.4769 11.9281 16.3882 11.9281H20.0144C20.5921 11.9281 21.0603 12.3964 21.0603 12.974Z"
                                    fill="white"
                                />
                            </svg>
                        </button>

                        <button
                            className={`${btnClassBase} hover:scale-110 ml-2`}
                            style={btnStyle}
                            onClick={handleExpandSideBarBtn}
                            title="Expand Menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="#542B00" className={`${iconClass} scale-130`}>
                                <path
                                    d="M4.53103 1.25533V11.7391M2.56532 0.600098H10.4282C11.5138 0.600098 12.3939 1.48018 12.3939 2.56581V10.4287C12.3939 11.5143 11.5138 12.3944 10.4282 12.3944H2.56532C1.47969 12.3944 0.599609 11.5143 0.599609 10.4287V2.56581C0.599609 1.48018 1.47969 0.600098 2.56532 0.600098Z"
                                    fill="#542B00"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <div
                    className={`${containerClass} absolute z-30 ${chatsHover ? 'translate-x-0' : '-translate-x-[calc(100%-3rem)]'}`}
                    style={{ ...containerClassStyle, color: 'var(--walnut-pale)' }}
                    onMouseEnter={() => setChatsHover(true)}
                    onMouseLeave={() => setChatsHover(false)}
                    onClick={handleExpandSideBarBtn}
                >
                    Chat
                    <button className={btnClass} style={btnStyle} onClick={handleExpandSideBarBtn} title="Open Chats">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" className={iconClass}>
                            <path
                                d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"
                                fill="#542B00"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SideButtons;