
module.exports = {

	development : {
		blogcategories:['travel','tech','lifestyle'],
		featuredpost:'get-your-metal-tested---part-2-test-angularjs-and-typescript-with-karma-and-tjangular',
		adminemail:'christopher@supnig.com',
		db: 'mongodb://localhost/blog',
		postsperpage:5,
		sendmail:"/usr/sbin/sendmail",
		facebook: {
			clientID: "194935747224798",
			clientSecret: "356f4c3d963cce5585c420e82e195671",
			callbackURL: "http://www.supnig.com/auth/facebook/callback"
		},

        twitter: {
            consumerKey: "fE1o4tiIEvuHnsrq8uLmIVddy",
            consumerSecret: "JJfZdxVhrqgGSz3rvx2OBol2W2eDljIlrzOgOcXSuWsBAPGTTM",
            callbackURL: "https://www.supnig.com/auth/twitter/callback"
        },

		google: {
			clientID: "{{PLACEHOLDER}}",
			clientSecret: "{{PLACEHOLDER}}",
			callbackURL: "{{PLACEHOLDER}}"
		},
		blockedips : ["78.46.37.73"]
	}
};
