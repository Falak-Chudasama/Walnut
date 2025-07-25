function WalnutTitleLogo(shrinkSize: boolean) {
    return (
        <div className={`${
            shrinkSize 
                ? "scale-40 w-fit h-fit top-0 left-0 pt-7 pl-17 origin-top-left" 
                : "scale-100 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        } duration-500 fixed z-10 ease-in-out`}>
            <div className="flex items-center justify-center">
                <img src="./walnut.png" alt="walnut-logo" className="h-20" />
                <h1 className="ml-4">
                    <span className="text-7xl text-walnut-accent font-pacifico">Wal</span>
                    <span className="text-7xl text-walnut-dark font-pacifico">nut</span>
                </h1>
            </div>
            <h6 className={`text-xl text-walnut-accent text-center duration-500 ${shrinkSize ? "opacity-0" : "opacity-100"}`}>
                Let's <span className="text-walnut-dark">crack</span> a nut...
            </h6>
        </div>
    );
};

export default WalnutTitleLogo;