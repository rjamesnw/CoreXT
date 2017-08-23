## Core XT

The Catmedis CoreXT system is an extension framework used with the .Net Core Standard framework.  It provides many utility methods to make development a little easier in the .Net Core environment.

The CoreXT.MVC assembly is especially useful for those who wish to have a more facile development experience working with MVC on the ASP.Net Core stack. Those migrating from ASP.Net MVC 4 and earlier projects might enjoy the extra help this system provides in making the task less daunting.

## Repositories

All the related assemblies are as follows:

* CoreXT - The core extension method assembly.
* CoreXT.MVC - The core MVC extension method assembly.

## Install

Use NuGet to install the assemblies.

    install-package CoreXT
    install-package CoreXT.MVC

Once installed, simply put the following at the top of your code:
    
    using CoreXT;

For MVC projects on .Net Core, add the following also:

    using CoreXT.MVC;
