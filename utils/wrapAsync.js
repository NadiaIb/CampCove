const wrapAsync = func => { // func = function you pass in
  return(req,res,next)=>{ //returns a new func
    func(req,res,next).catch(next) // has func executed and catches errors and passes it to next
  }
}

export default wrapAsync