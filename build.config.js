module.exports = {
    dir:{
        compile: 'public',
        assets: 'assets',
        vendor: 'vendorfiles',
        src: 'src',
        views: 'app/views'
    },
    
    src:{
       less: 'app/src/less/main.less',
       ts: ['app/src/**/*.ts'],
        tslibs:'libs/**/*.ts',
        js: ['app/src/**/*.js'],
        index: 'app/src/html/index.html'
    }
};