var bcrypt = require('bcrypt');
var mongoskin = require('mongoskin')








/*
GET delete attributes permissions from list
*/

exports.delattr = function(req,res,next) {
    console.log(req.params);

    req.collections.users.update({name : req.params.name},{ $pull: { homepi: { $in: [req.params.val] }} },{ multi: true },function(error){
        if(error)
            console.log("Error: editing Attributes 1");

        req.collections.users.update({name : 'homepi'},{ $pull: { [req.params.val] : { $in: [req.params.name]}} },{ multi: true },function(error2){
            if(error)
                console.log("Error: editing Attributes 2");
            res.redirect('/admin?deletd=' + "Acessebility to the Attribute " + req.params.val + " was revoked from User " + req.params.name);

            });

        });

    }



/*
GET delete user from list
*/

exports.deluser = function(req,res,next) {

    req.collections.users.findOne({name: req.params.name},function(error, delusr) {
        if(error)
            res.send("Error deleting user");


        if (delusr){

            for (p in delusr.homepi){

                var jsonkey = delusr.homepi[p];

                req.collections.users.update({name : 'homepi'},{$pull : {[jsonkey]: { $in: [req.params.name]}}},{ multi: true },function(error,doc){
                if(error)
                    console.log("Error");
                    });

                }
            }
        req.collections.users.remove({_id: new mongoskin.ObjectID( req.params._id) },function(err,doc){
            if(err)
                res.send("Error deleting user");

            res.redirect('/admin?deletd=' + "User " + req.params.name + " deleted successfully");

            });


        });


    };



/*
GET senzUser listing
*/

exports.getusers = function(req,res,next) {
    var deleted = req.query.deletd;
    req.collections.users.find({}, {sort: {_id:-1}}).toArray(function(error, users) {
        if (error) return next(error);
        if (users.length === 0)
            res.render('admin',{users:users});
        else
            res.render('admin',{users:users, error:deleted});
    });
};




/*
GET edituser page
*/
exports.edituser = function(req, res, next) {
  res.render('edituser');
};





/*
POST edit user data to DB
*/

exports.edit = function(req, res,next){

    if (!req.body.password)
        return res.render('edituser' , {error: "fill the password Field"});

    if (!req.body.confirm)
        return res.render('edituser', {error: "fill the password Confirmation Field"});
    if (req.body.password === req.body.confirm)
        {
            hashedPassword = bcrypt.hashSync(req.body.password,10);
            req.collections.adminDb.update({username :'admin'}, {$set:{password:hashedPassword}}, function(err, result) {
                if (err)
                Console.log("error");
                else {
                    console.log("confirmed");
                    req.session.destroy();
                    res.render('login', {error: "Login again with the new password to continue"});
                }
            });
        }

    else return res.render('edituser', {error: "Password and the confirmation do not match"});

};






/*
 * GET login page.
 */

exports.login = function(req, res, next) {
  res.render('login');
};



/*
 * GET logout route.
 */
exports.logout = function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
};




/*
 * POST authenticate route.
 */
exports.authenticate = function(req, res, next) {

  if (!req.body.username || !req.body.password)
    return res.render('login', {error: "Please enter your Username and password."});

  req.collections.adminDb.findOne({
    username: req.body.username
    }, function(error, user){
    if (error) return next(error);
    if (!user) return res.render('login', {error: "Incorrect Username&password combination."});
    validPassword = bcrypt.compareSync(req.body.password , user.password);
    if (!validPassword) return res.render('login', {error: "You might have Forgotten your password , Just try the default"});

    console.log(validPassword);
    req.session.user = user;
    req.session.admin = user.admin;
    res.redirect('/admin');
  })
};