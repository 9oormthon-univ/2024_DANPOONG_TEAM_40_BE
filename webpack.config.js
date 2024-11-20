import nodeExternals from "webpack-node-externals";
import path from "path";

export default {
    mode: "development",
    entry: {
        app: './index.js',
    },
    output: {
        path: path.resolve('./dist'),
        filename: "main.cjs",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    target: "node",
    externalsPresets: {
        node: true,
    },
    externals: [nodeExternals()],
};