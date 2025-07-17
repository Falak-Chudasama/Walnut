function WalnutTitleLogo(shrinkSize: boolean) {
    return (
        <div className={`${shrinkSize ? "scale-50 w-min h-min" : "scale-100 justify-center"} duration-500 grid`}>
            <div className="flex items-center justify-center">
                <img src="./walnut.png" alt="walnut-logo" className="h-20" />
                <h1 className="ml-4">
                    <span className="text-7xl text-walnut-accent font-pacifico">Wal</span>
                    <span className="text-7xl text-walnut-dark font-pacifico">nut</span>
                </h1>
            </div>
            {
                shrinkSize ? (<div></div>) :
                <h6 className="text-xl text-walnut-accent text-center duration-500">
                    Let's <span className="text-walnut-dark">crack</span> a nut...
                </h6>
            }
        </div>
    );
};

export default WalnutTitleLogo;